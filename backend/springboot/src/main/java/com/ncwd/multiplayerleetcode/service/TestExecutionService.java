package com.ncwd.multiplayerleetcode.service;

import org.springframework.stereotype.Service;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.TimeUnit;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
public class TestExecutionService {
    
    private static final String PROBLEMS_PATH = "lcpy/problems";
    private static final String PYTHON_VENV_PATH = "lcpy/venv/Scripts/python.exe";
    private static final long TIMEOUT_SECONDS = 10;
    
    /**
     * Executes all test cases for a problem using pytest
     * @param problemSlug The problem slug (e.g., "add_two_numbers")
     * @param userCode The user's Python code
     * @return TestExecutionResult containing all test case results
     */
    public TestExecutionResult executeTests(String problemSlug, String userCode) {
        long startTime = System.currentTimeMillis();
        
        try {
            // Get the problem directory
            Path problemDir = Paths.get(PROBLEMS_PATH, problemSlug);
            
            if (!Files.exists(problemDir)) {
                TestExecutionResult result = new TestExecutionResult();
                result.setStatus("error");
                result.setErrorMessage("Problem directory not found: " + problemSlug);
                result.setExecutionTimeMs(System.currentTimeMillis() - startTime);
                return result;
            }
            
            // Write user code to solution.py in problem directory
            Path userSolutionPath = problemDir.resolve("solution.py");
            // Backup original solution if it exists
            Path backupPath = problemDir.resolve("solution_backup.py");
            if (Files.exists(userSolutionPath)) {
                Files.copy(userSolutionPath, backupPath, java.nio.file.StandardCopyOption.REPLACE_EXISTING);
            }
            Files.writeString(userSolutionPath, userCode);
            
            // Execute pytest with verbose output
            String pythonExec = Files.exists(Paths.get(PYTHON_VENV_PATH)) ? PYTHON_VENV_PATH : "python";
            ProcessBuilder pb = new ProcessBuilder(
                pythonExec, "-m", "pytest", 
                "test_solution.py", 
                "-v", 
                "--tb=line"
            );
            pb.directory(problemDir.toFile());
            pb.redirectErrorStream(false);
            
            Process process = pb.start();
            
            // Read stdout and stderr streams asynchronously to prevent buffer deadlock
            StringBuilder stdout = new StringBuilder();
            StringBuilder stderr = new StringBuilder();
            
            // Start threads to read streams asynchronously
            Thread stdoutThread = new Thread(() -> {
                try (BufferedReader reader = new BufferedReader(new InputStreamReader(process.getInputStream()))) {
                    String line;
                    while ((line = reader.readLine()) != null) {
                        stdout.append(line).append("\n");
                    }
                } catch (Exception e) {
                    // Ignore - process may have been terminated
                }
            });
            
            Thread stderrThread = new Thread(() -> {
                try (BufferedReader reader = new BufferedReader(new InputStreamReader(process.getErrorStream()))) {
                    String line;
                    while ((line = reader.readLine()) != null) {
                        stderr.append(line).append("\n");
                    }
                } catch (Exception e) {
                    // Ignore - process may have been terminated
                }
            });
            
            stdoutThread.start();
            stderrThread.start();
            
            // Wait for process with timeout
            boolean completed = process.waitFor(TIMEOUT_SECONDS, TimeUnit.SECONDS);
            long executionTime = System.currentTimeMillis() - startTime;
            
            if (!completed) {
                process.destroyForcibly();
                process.waitFor(1, TimeUnit.SECONDS);
                
                // Wait for stream readers to finish
                stdoutThread.join(1000);
                stderrThread.join(1000);
                
                // Cleanup
                if (Files.exists(backupPath)) {
                    Files.move(backupPath, userSolutionPath, java.nio.file.StandardCopyOption.REPLACE_EXISTING);
                }
                
                TestExecutionResult result = new TestExecutionResult();
                result.setStatus("timeout");
                result.setErrorMessage("Test execution exceeded " + TIMEOUT_SECONDS + " seconds");
                result.setExecutionTimeMs(executionTime);
                return result;
            }
            
            // Wait for stream readers to finish reading remaining output
            stdoutThread.join(1000);
            stderrThread.join(1000);
            
            executionTime = System.currentTimeMillis() - startTime;
            
            // Parse pytest output (include problemDir so we can read test file for param names)
            TestExecutionResult result = parsePytestOutput(stdout.toString(), stderr.toString(), executionTime, problemDir);
            
            // Cleanup
            if (Files.exists(backupPath)) {
                Files.move(backupPath, userSolutionPath, java.nio.file.StandardCopyOption.REPLACE_EXISTING);
            }
            
            return result;
            
        } catch (Exception e) {
            long executionTime = System.currentTimeMillis() - startTime;
            TestExecutionResult result = new TestExecutionResult();
            result.setStatus("error");
            result.setErrorMessage("Execution error: " + e.getMessage());
            result.setExecutionTimeMs(executionTime);
            return result;
        }
    }
    
    private TestExecutionResult parsePytestOutput(String stdout, String stderr, long executionTime, Path problemDir) {
        TestExecutionResult result = new TestExecutionResult();
        result.setExecutionTimeMs(executionTime);
        List<TestCase> testCases = new ArrayList<>();
        
        // Attempt to read param names from test file (e.g., "nums, target, expected")
        String[] paramNames = new String[0];
        try {
            Path testFile = problemDir.resolve("test_solution.py");
            if (Files.exists(testFile)) {
                String testContent = Files.readString(testFile);
                Pattern p = Pattern.compile("parametrize\\s*\\(\\s*\"([^\"]+)\"");
                Matcher m = p.matcher(testContent);
                if (m.find()) {
                    String names = m.group(1);
                    String[] parts = names.split(",");
                    for (int i = 0; i < parts.length; i++) {
                        parts[i] = parts[i].trim();
                    }
                    paramNames = parts;
                }
            }
        } catch (Exception e) {
            // ignore - best-effort
        }
        
        // Parse pytest output
        String[] lines = stdout.split("\n");
        int passedCount = 0;
        int failedCount = 0;
        
        for (int li = 0; li < lines.length; li++) {
            String line = lines[li];
            // Look for test result lines - format: "test_solution.py::TestClass::test_name[params] PASSED/FAILED"
            if ((line.contains("::test_") || line.contains("::Test")) && (line.contains("PASSED") || line.contains("FAILED"))) {
                TestCase testCase = new TestCase();
                
                boolean passed = line.contains("PASSED");
                testCase.setPassed(passed);
                if (passed) {
                    passedCount++;
                } else {
                    failedCount++;
                }
                
                String params = null;
                // Extract bracketed id from the summary line
                if (line.contains("[") && line.contains("]")) {
                    int startBracket = line.indexOf("[");
                    int endBracket = line.lastIndexOf("]");
                    if (startBracket > 0 && endBracket > startBracket) {
                        params = line.substring(startBracket + 1, endBracket);
                        testCase.setInput(params); // fallback: the pytest id
                    }
                }
                
                // Extract test name
                String testName = null;
                if (line.contains("::")) {
                    int lastColonIdx = line.lastIndexOf("::");
                    int endIdx = line.indexOf("[", lastColonIdx);
                    if (endIdx < 0) endIdx = line.indexOf(" ", lastColonIdx);
                    if (endIdx < 0) endIdx = line.length();
                    if (lastColonIdx >= 0 && endIdx > lastColonIdx + 2) {
                        testName = line.substring(lastColonIdx + 2, endIdx);
                        testCase.setTestName(testName);
                    }
                }
                
                // If test failed (or for better display), try to locate the detailed failure block and extract actual python input/expected values
                if (!passed && params != null) {
                    String headerCandidate = line;
                    // Trim trailing status
                    int statusIdx = Math.max(line.indexOf("PASSED"), line.indexOf("FAILED"));
                    if (statusIdx >= 0) {
                        headerCandidate = line.substring(0, statusIdx).trim();
                    }
                    int headerIdx = stdout.indexOf(headerCandidate);
                    if (headerIdx < 0) {
                        // try replacing :: with . as pytest uses dots in section headers
                        headerIdx = stdout.indexOf(headerCandidate.replace("::", "."));
                    }
                    if (headerIdx >= 0) {
                        int scanEnd = Math.min(stdout.length(), headerIdx + 2000);
                        String block = stdout.substring(headerIdx, scanEnd);
                        // Try extracting named parameter assignments like "nums = [..]"
                        String[] foundValues = new String[paramNames.length];
                        boolean anyFound = false;
                        for (int pi = 0; pi < paramNames.length; pi++) {
                            String param = paramNames[pi];
                            Pattern pv = Pattern.compile("\\b" + Pattern.quote(param) + "\\s*=\\s*([^\\n\\r]+)");
                            Matcher mv = pv.matcher(block);
                            if (mv.find()) {
                                String val = mv.group(1).trim();
                                foundValues[pi] = val;
                                anyFound = true;
                            }
                        }
                        if (anyFound) {
                            // Build a tuple-like input display
                            StringBuilder sb = new StringBuilder();
                            sb.append("(");
                            for (int i = 0; i < foundValues.length; i++) {
                                if (i > 0) sb.append(", ");
                                sb.append(foundValues[i] == null ? "None" : foundValues[i]);
                            }
                            sb.append(")");
                            testCase.setInput(sb.toString());
                            // If one of the params is named 'expected', set expectedOutput
                            for (int i = 0; i < paramNames.length; i++) {
                                if (paramNames[i].equalsIgnoreCase("expected") && foundValues[i] != null) {
                                    testCase.setExpectedOutput(foundValues[i]);
                                }
                            }
                        } else {
                            // Fallback: try to find first parenthesized group in the block which may contain the param tuple
                            Pattern tuple = Pattern.compile("\\(([^\\)]{1,500})\\)");
                            Matcher tm = tuple.matcher(block);
                            if (tm.find()) {
                                String tupleVal = "(" + tm.group(1).trim() + ")";
                                testCase.setInput(tupleVal);
                                // try to infer expected from last comma-separated element
                                String inside = tm.group(1).trim();
                                String[] elems = inside.split(",");
                                if (elems.length > 0) {
                                    testCase.setExpectedOutput(elems[elems.length - 1].trim());
                                }
                            }
                        }
                    }
                }
                
                testCases.add(testCase);
            }
        }
        
        result.setTestCases(testCases);
        result.setPassedCount(passedCount);
        result.setFailedCount(failedCount);
        result.setTotalCount(passedCount + failedCount);
        
        if (failedCount == 0 && passedCount > 0) {
            result.setStatus("all_passed");
        } else if (passedCount > 0) {
            result.setStatus("some_failed");
        } else if (failedCount > 0) {
            result.setStatus("all_failed");
        } else {
            result.setStatus("error");
        }
        
        // Include stderr if there were errors
        if (!stderr.isEmpty() && result.getStatus().equals("error")) {
            result.setErrorMessage(stderr);
        }
        
        return result;
    }
    
    public static class TestExecutionResult {
        private String status; // "all_passed", "some_failed", "all_failed", "error", "timeout"
        private List<TestCase> testCases;
        private int totalCount;
        private int passedCount;
        private int failedCount;
        private String errorMessage;
        private long executionTimeMs;
        
        public TestExecutionResult() {
            this.testCases = new ArrayList<>();
        }
        
        // Getters and setters
        public String getStatus() {
            return status;
        }
        
        public void setStatus(String status) {
            this.status = status;
        }
        
        public List<TestCase> getTestCases() {
            return testCases;
        }
        
        public void setTestCases(List<TestCase> testCases) {
            this.testCases = testCases;
        }
        
        public int getTotalCount() {
            return totalCount;
        }
        
        public void setTotalCount(int totalCount) {
            this.totalCount = totalCount;
        }
        
        public int getPassedCount() {
            return passedCount;
        }
        
        public void setPassedCount(int passedCount) {
            this.passedCount = passedCount;
        }
        
        public int getFailedCount() {
            return failedCount;
        }
        
        public void setFailedCount(int failedCount) {
            this.failedCount = failedCount;
        }
        
        public String getErrorMessage() {
            return errorMessage;
        }
        
        public void setErrorMessage(String errorMessage) {
            this.errorMessage = errorMessage;
        }
        
        public long getExecutionTimeMs() {
            return executionTimeMs;
        }
        
        public void setExecutionTimeMs(long executionTimeMs) {
            this.executionTimeMs = executionTimeMs;
        }
    }
    
    public static class TestCase {
        private String testName;
        private String input;
        private String expectedOutput;
        private String actualOutput;
        private boolean passed;
        private String errorMessage;
        
        // Getters and setters
        public String getTestName() {
            return testName;
        }
        
        public void setTestName(String testName) {
            this.testName = testName;
        }
        
        public String getInput() {
            return input;
        }
        
        public void setInput(String input) {
            this.input = input;
        }
        
        public String getExpectedOutput() {
            return expectedOutput;
        }
        
        public void setExpectedOutput(String expectedOutput) {
            this.expectedOutput = expectedOutput;
        }
        
        public String getActualOutput() {
            return actualOutput;
        }
        
        public void setActualOutput(String actualOutput) {
            this.actualOutput = actualOutput;
        }
        
        public boolean isPassed() {
            return passed;
        }
        
        public void setPassed(boolean passed) {
            this.passed = passed;
        }
        
        public String getErrorMessage() {
            return errorMessage;
        }
        
        public void setErrorMessage(String errorMessage) {
            this.errorMessage = errorMessage;
        }
    }
}
