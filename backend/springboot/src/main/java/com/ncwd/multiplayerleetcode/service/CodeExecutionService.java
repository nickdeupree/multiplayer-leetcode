package com.ncwd.multiplayerleetcode.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Map;
import java.util.concurrent.TimeUnit;

@Service
public class CodeExecutionService {
    
    private static final String PROBLEMS_PATH = "lcpy/problems";
    private static final String PYTHON_VENV_PATH = "lcpy/venv/Scripts/python.exe";
    private static final long TIMEOUT_SECONDS = 2;
    
    @Autowired
    private TestCaseExtractor testCaseExtractor;
    
    /**
     * Executes user code against a specific test case
     * @param problemSlug The problem slug (e.g., "add_two_numbers")
     * @param userCode The user's Python code
     * @param testCaseIndex The index of the test case to run (0-based)
     * @return ExecutionResult containing status, outputs, and timing
     */
    public ExecutionResult executeCode(String problemSlug, String userCode, int testCaseIndex) {
        long startTime = System.currentTimeMillis();
        
        try {
            // Get the problem directory
            Path problemDir = Paths.get(PROBLEMS_PATH, problemSlug);
            
            if (!Files.exists(problemDir)) {
                return new ExecutionResult("error", null, null, 
                    "Problem directory not found: " + problemSlug, 
                    System.currentTimeMillis() - startTime);
            }
            
            // Extract test case
            TestCaseExtractor.TestCase testCase = testCaseExtractor.extractTestCase(problemSlug, testCaseIndex);
            
            // Write user code to temporary file in problem directory
            Path userSolutionPath = problemDir.resolve("user_solution.py");
            Files.writeString(userSolutionPath, userCode);
            
            // Generate execution script
            String executionScript = generateExecutionScript(problemSlug, testCase);
            Path scriptPath = problemDir.resolve("execute_test.py");
            Files.writeString(scriptPath, executionScript);
            
            // Execute the script with timeout using venv Python
            String pythonExec = Files.exists(Paths.get(PYTHON_VENV_PATH)) ? PYTHON_VENV_PATH : "python";
            ProcessBuilder pb = new ProcessBuilder(pythonExec, "execute_test.py");
            pb.directory(problemDir.toFile());
            pb.redirectErrorStream(false);
            
            Process process = pb.start();
            
            // Read stdout and stderr streams (but only after process completes or is killed)
            BufferedReader stdoutReader = new BufferedReader(new InputStreamReader(process.getInputStream()));
            BufferedReader stderrReader = new BufferedReader(new InputStreamReader(process.getErrorStream()));
            
            StringBuilder stdout = new StringBuilder();
            StringBuilder stderr = new StringBuilder();
            
            // Wait for process with timeout
            boolean completed = process.waitFor(TIMEOUT_SECONDS, TimeUnit.SECONDS);
            long executionTime = System.currentTimeMillis() - startTime;
            
            if (!completed) {
                // Kill the process immediately if it exceeded the timeout
                process.destroyForcibly();
                // Give the OS a short moment to clean up and flush streams
                process.waitFor(1, TimeUnit.SECONDS);
                
                // Read any remaining outputs after kill
                String line;
                while ((line = stdoutReader.readLine()) != null) {
                    stdout.append(line).append("\n");
                }
                while ((line = stderrReader.readLine()) != null) {
                    stderr.append(line).append("\n");
                }
                
                // Cleanup
                Files.deleteIfExists(userSolutionPath);
                Files.deleteIfExists(scriptPath);
                
                return new ExecutionResult("infinite_loop", null, null,
                    "Possible infinite loop: execution exceeded " + TIMEOUT_SECONDS + " seconds",
                    executionTime);
            }
            
            // Process completed within timeout — read outputs
            String line;
            while ((line = stdoutReader.readLine()) != null) {
                stdout.append(line).append("\n");
            }
            while ((line = stderrReader.readLine()) != null) {
                stderr.append(line).append("\n");
            }
            
            // Cleanup
            Files.deleteIfExists(userSolutionPath);
            Files.deleteIfExists(scriptPath);
            
            executionTime = System.currentTimeMillis() - startTime;
            
            int exitCode = process.exitValue();
            
            // Parse the output
            return parseExecutionOutput(stdout.toString(), stderr.toString(), exitCode, executionTime);
            
        } catch (Exception e) {
            long executionTime = System.currentTimeMillis() - startTime;
            return new ExecutionResult("error", null, null, 
                "Execution error: " + e.getMessage(), 
                executionTime);
        }
    }
    
    /**
     * Extracts the run and assert function names from helpers.py
     * @param problemSlug The problem slug
     * @return Array with [runFunctionName, assertFunctionName] or null if not found
     */
    private String[] extractHelperFunctionNames(String problemSlug) {
        try {
            Path helpersPath = Paths.get(PROBLEMS_PATH, problemSlug, "helpers.py");
            if (!Files.exists(helpersPath)) {
                return null;
            }
            
            String content = Files.readString(helpersPath);
            String[] lines = content.split("\n");
            
            String runFunction = null;
            String assertFunction = null;
            
            for (String line : lines) {
                String trimmed = line.trim();
                if (trimmed.startsWith("def run_")) {
                    // Extract function name: "def run_something(" -> "run_something"
                    int endIdx = trimmed.indexOf('(');
                    if (endIdx > 0) {
                        runFunction = trimmed.substring(4, endIdx);
                    }
                } else if (trimmed.startsWith("def assert_")) {
                    // Extract function name: "def assert_something(" -> "assert_something"
                    int endIdx = trimmed.indexOf('(');
                    if (endIdx > 0) {
                        assertFunction = trimmed.substring(4, endIdx);
                    }
                }
            }
            
            return new String[] { runFunction, assertFunction };
        } catch (Exception e) {
            return null;
        }
    }
    
    private String generateExecutionScript(String problemSlug, TestCaseExtractor.TestCase testCase) {
        StringBuilder script = new StringBuilder();
        
        script.append("import sys\n");
        script.append("import json\n");
        script.append("import traceback\n");
        script.append("from user_solution import Solution\n");
        script.append("from helpers import *\n\n");
        
        script.append("def main():\n");
        script.append("    try:\n");
        
        // Get parameters
        Map<String, Object> params = testCase.getParameters();
        
        // Extract input parameters (all except the last one which is expected)
        StringBuilder inputParams = new StringBuilder();
        String expectedParam = null;
        
        for (Map.Entry<String, Object> entry : params.entrySet()) {
            String key = entry.getKey();
            String value = convertToPythonLiteral(entry.getValue().toString());
            
            if (key.contains("expected")) {
                expectedParam = key;
                script.append("        ").append(key).append(" = ").append(value).append("\n");
            } else {
                script.append("        ").append(key).append(" = ").append(value).append("\n");
                if (inputParams.length() > 0) {
                    inputParams.append(", ");
                }
                inputParams.append(key);
            }
        }
        
        // Extract actual function names from helpers.py
        String[] functionNames = extractHelperFunctionNames(problemSlug);
        String runFunctionName = (functionNames != null && functionNames[0] != null) 
            ? functionNames[0] : problemSlug;
        String assertFunctionName = (functionNames != null && functionNames[1] != null) 
            ? functionNames[1] : problemSlug;
        
        script.append("\n");
        script.append("        # Execute the user's solution\n");
        script.append("        result = ").append(runFunctionName).append("(Solution");
        if (inputParams.length() > 0) {
            script.append(", ").append(inputParams);
        }
        script.append(")\n\n");
        
        script.append("        # Convert result to string for display\n");
        script.append("        from leetcode_py import ListNode, TreeNode\n");
        script.append("        if isinstance(result, ListNode):\n");
        script.append("            actual_output = str(result.to_list())\n");
        script.append("        elif isinstance(result, TreeNode):\n");
        script.append("            actual_output = str(result.to_list())\n");
        script.append("        else:\n");
        script.append("            actual_output = str(result)\n\n");
        
        if (expectedParam != null) {
            script.append("        # Run assertion\n");
            script.append("        try:\n");
            script.append("            ").append(assertFunctionName).append("(result, ").append(expectedParam).append(")\n");
            script.append("            status = 'success'\n");
            script.append("        except AssertionError as e:\n");
            script.append("            status = 'failed'\n\n");
            
            script.append("        # Format expected output\n");
            script.append("        expected_output = str(").append(expectedParam).append(")\n\n");
        } else {
            script.append("        status = 'success'\n");
            script.append("        expected_output = 'N/A'\n\n");
        }
        
        script.append("        # Output result as JSON\n");
        script.append("        result_data = {\n");
        script.append("            'status': status,\n");
        script.append("            'actualOutput': actual_output,\n");
        script.append("            'expectedOutput': expected_output\n");
        script.append("        }\n");
        script.append("        print('RESULT_START')\n");
        script.append("        print(json.dumps(result_data))\n");
        script.append("        print('RESULT_END')\n\n");
        
        script.append("    except SyntaxError as e:\n");
        script.append("        tb = traceback.format_exc()\n");
        script.append("        result_data = {\n");
        script.append("            'status': 'error',\n");
        script.append("            'actualOutput': None,\n");
        script.append("            'expectedOutput': None,\n");
        script.append("            'errorType': 'SyntaxError',\n");
        script.append("            'errorMessage': str(e),\n");
        script.append("            'traceback': tb\n");
        script.append("        }\n");
        script.append("        print('RESULT_START')\n");
        script.append("        print(json.dumps(result_data))\n");
        script.append("        print('RESULT_END')\n");
        script.append("        sys.exit(1)\n\n");
        
        script.append("    except Exception as e:\n");
        script.append("        tb = traceback.format_exc()\n");
        script.append("        result_data = {\n");
        script.append("            'status': 'error',\n");
        script.append("            'actualOutput': None,\n");
        script.append("            'expectedOutput': None,\n");
        script.append("            'errorType': type(e).__name__,\n");
        script.append("            'errorMessage': str(e),\n");
        script.append("            'traceback': tb\n");
        script.append("        }\n");
        script.append("        print('RESULT_START')\n");
        script.append("        print(json.dumps(result_data))\n");
        script.append("        print('RESULT_END')\n");
        script.append("        sys.exit(1)\n\n");
        
        script.append("if __name__ == '__main__':\n");
        script.append("    main()\n");
        
        return script.toString();
    }
    
    /**
     * Converts JSON-formatted values to Python literals
     * Specifically handles boolean conversion: true/false -> True/False
     */
    private String convertToPythonLiteral(String value) {
        if (value == null) {
            return "None";
        }
        
        // Handle JSON boolean values
        if (value.equals("true")) {
            return "True";
        }
        if (value.equals("false")) {
            return "False";
        }
        
        // Handle null
        if (value.equals("null")) {
            return "None";
        }
        
        // Return as-is for other values (numbers, strings, lists, etc.)
        return value;
    }
    
    private ExecutionResult parseExecutionOutput(String stdout, String stderr, int exitCode, long executionTime) {
        // Look for RESULT_START and RESULT_END markers
        int startIdx = stdout.indexOf("RESULT_START");
        int endIdx = stdout.indexOf("RESULT_END");
        
        if (startIdx != -1 && endIdx != -1) {
            String jsonResult = stdout.substring(startIdx + "RESULT_START".length(), endIdx).trim();
            
            try {
                // Simple JSON parsing
                return parseJsonResult(jsonResult, executionTime);
            } catch (Exception e) {
                return new ExecutionResult("error", null, null, 
                    "Failed to parse result: " + e.getMessage(), 
                    executionTime);
            }
        }
        
        // If no markers found, check stderr for errors
        if (!stderr.isEmpty()) {
            return new ExecutionResult("error", null, null, 
                "Runtime error:\n" + stderr, 
                executionTime);
        }
        
        return new ExecutionResult("error", null, null, 
            "Unknown execution error", 
            executionTime);
    }
    
    private ExecutionResult parseJsonResult(String json, long executionTime) {
        // Simple JSON parsing (could use Jackson or Gson for production)
        try {
            json = json.trim();
            if (json.startsWith("{") && json.endsWith("}")) {
                json = json.substring(1, json.length() - 1);
            }
            
            String status = null;
            String actualOutput = null;
            String expectedOutput = null;
            String errorMessage = null;
            String errorType = null;
            String traceback = null;
            
            String[] pairs = json.split(",(?=(?:[^\"]*\"[^\"]*\")*[^\"]*$)"); // Split by comma outside quotes
            
            for (String pair : pairs) {
                String[] kv = pair.split(":", 2);
                if (kv.length == 2) {
                    String key = kv[0].trim().replace("\"", "").replace("'", "");
                    String value = kv[1].trim();
                    
                    // Remove quotes from string values
                    if (value.startsWith("\"") && value.endsWith("\"")) {
                        value = value.substring(1, value.length() - 1);
                        // Unescape newlines and other special characters
                        value = value.replace("\\n", "\n")
                                     .replace("\\r", "\r")
                                     .replace("\\t", "\t")
                                     .replace("\\\"", "\"")
                                     .replace("\\\\", "\\");
                    } else if (value.startsWith("'") && value.endsWith("'")) {
                        value = value.substring(1, value.length() - 1);
                    }
                    
                    // Handle None/null
                    if (value.equals("None") || value.equals("null")) {
                        value = null;
                    }
                    
                    switch (key) {
                        case "status":
                            status = value;
                            break;
                        case "actualOutput":
                            actualOutput = value;
                            break;
                        case "expectedOutput":
                            expectedOutput = value;
                            break;
                        case "errorMessage":
                            errorMessage = value;
                            break;
                        case "errorType":
                            errorType = value;
                            break;
                        case "traceback":
                            traceback = value;
                            break;
                    }
                }
            }
            
            return new ExecutionResult(status, actualOutput, expectedOutput, errorMessage, errorType, traceback, executionTime);
            
        } catch (Exception e) {
            return new ExecutionResult("error", null, null, 
                "JSON parsing error: " + e.getMessage(), null, null, 
                executionTime);
        }
    }
    
    public static class ExecutionResult {
        private final String status; // "success", "failed", "error", "timeout"
        private final String actualOutput;
        private final String expectedOutput;
        private final String errorMessage;
        private final String errorType;
        private final String traceback;
        private final long executionTimeMs;
        
        public ExecutionResult(String status, String actualOutput, String expectedOutput, 
                             String errorMessage, long executionTimeMs) {
            this(status, actualOutput, expectedOutput, errorMessage, null, null, executionTimeMs);
        }
        
        public ExecutionResult(String status, String actualOutput, String expectedOutput, 
                             String errorMessage, String errorType, String traceback, long executionTimeMs) {
            this.status = status;
            this.actualOutput = actualOutput;
            this.expectedOutput = expectedOutput;
            this.errorMessage = errorMessage;
            this.errorType = errorType;
            this.traceback = traceback;
            this.executionTimeMs = executionTimeMs;
        }
        
        public String getStatus() {
            return status;
        }
        
        public String getActualOutput() {
            return actualOutput;
        }
        
        public String getExpectedOutput() {
            return expectedOutput;
        }
        
        public String getErrorMessage() {
            return errorMessage;
        }
        
        public String getErrorType() {
            return errorType;
        }
        
        public String getTraceback() {
            return traceback;
        }
        
        public long getExecutionTimeMs() {
            return executionTimeMs;
        }
    }
}
