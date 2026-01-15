package com.ncwd.multiplayerleetcode.service;

import org.springframework.stereotype.Service;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
public class TestCaseExtractor {
    
    private static final String PROBLEMS_PATH = "lcpy/problems";
    private static final String PYTHON_VENV_PATH = "lcpy/venv/Scripts/python.exe";
    
    /**
     * Extracts a single test case from test_solution.py by index
     * @param problemSlug The problem slug (e.g., "add_two_numbers")
     * @param testCaseIndex The index of the test case to extract (0-based)
     * @return TestCase object containing parameter names and values
     */
    public TestCase extractTestCase(String problemSlug, int testCaseIndex) throws Exception {
        Path testFilePath = Paths.get(PROBLEMS_PATH, problemSlug, "test_solution.py");
        
        if (!Files.exists(testFilePath)) {
            throw new Exception("Test file not found for problem: " + problemSlug);
        }
        
        // Create Python script to extract test case
        String extractorScript = createExtractorScript(testFilePath.toString(), testCaseIndex);
        Path scriptFile = Files.createTempFile("test_extractor_", ".py");
        Files.writeString(scriptFile, extractorScript);
        
        // Execute extractor script using venv Python
        String pythonExec = Files.exists(Paths.get(PYTHON_VENV_PATH)) ? PYTHON_VENV_PATH : "python";
        ProcessBuilder pb = new ProcessBuilder(pythonExec, scriptFile.toString());
        pb.redirectErrorStream(true);
        Process process = pb.start();
        
        BufferedReader reader = new BufferedReader(new InputStreamReader(process.getInputStream()));
        StringBuilder output = new StringBuilder();
        String line;
        while ((line = reader.readLine()) != null) {
            output.append(line).append("\n");
        }
        
        int exitCode = process.waitFor();
        
        // Cleanup
        Files.deleteIfExists(scriptFile);
        
        if (exitCode != 0) {
            throw new Exception("Failed to extract test case: " + output.toString());
        }
        
        // Parse the output
        return parseTestCaseOutput(output.toString());
    }
    
    /**
     * Gets the total count of test cases for a problem
     */
    public int getTestCaseCount(String problemSlug) throws Exception {
        Path testFilePath = Paths.get(PROBLEMS_PATH, problemSlug, "test_solution.py");
        
        if (!Files.exists(testFilePath)) {
            throw new Exception("Test file not found for problem: " + problemSlug);
        }
        
        // Create Python script to count test cases
        String counterScript = createCounterScript(testFilePath.toString());
        Path scriptFile = Files.createTempFile("test_counter_", ".py");
        Files.writeString(scriptFile, counterScript);
        
        // Execute counter script using venv Python
        String pythonExec = Files.exists(Paths.get(PYTHON_VENV_PATH)) ? PYTHON_VENV_PATH : "python";
        ProcessBuilder pb = new ProcessBuilder(pythonExec, scriptFile.toString());
        pb.redirectErrorStream(true);
        Process process = pb.start();
        
        BufferedReader reader = new BufferedReader(new InputStreamReader(process.getInputStream()));
        String output = reader.readLine();
        
        int exitCode = process.waitFor();
        
        // Cleanup
        Files.deleteIfExists(scriptFile);
        
        if (exitCode != 0 || output == null) {
            throw new Exception("Failed to count test cases");
        }
        
        try {
            return Integer.parseInt(output.trim());
        } catch (NumberFormatException e) {
            throw new Exception("Invalid test case count: " + output);
        }
    }
    
    private String createExtractorScript(String testFilePath, int testCaseIndex) {
        StringBuilder script = new StringBuilder();
        script.append("import ast\n");
        script.append("import sys\n");
        script.append("import json\n\n");
        
        script.append("def extract_test_case(filename, index):\n");
        script.append("    with open(filename, 'r') as f:\n");
        script.append("        tree = ast.parse(f.read())\n\n");
        
        script.append("    # Find the parametrize decorator\n");
        script.append("    for node in ast.walk(tree):\n");
        script.append("        if isinstance(node, ast.FunctionDef):\n");
        script.append("            for decorator in node.decorator_list:\n");
        script.append("                if isinstance(decorator, ast.Call):\n");
        script.append("                    if isinstance(decorator.func, ast.Attribute):\n");
        script.append("                        if decorator.func.attr == 'parametrize':\n");
        script.append("                            # Extract parameter names\n");
        script.append("                            param_names = ast.literal_eval(decorator.args[0])\n");
        script.append("                            param_names = [p.strip() for p in param_names.split(',')]\n\n");
        
        script.append("                            # Extract test cases\n");
        script.append("                            test_cases = ast.literal_eval(decorator.args[1])\n\n");
        
        script.append("                            if index >= len(test_cases):\n");
        script.append("                                print(f'Error: Test case index {index} out of range (total: {len(test_cases)})')\n");
        script.append("                                sys.exit(1)\n\n");
        
        script.append("                            # Get the specific test case\n");
        script.append("                            test_case = test_cases[index]\n\n");
        
        script.append("                            # Create parameter mapping\n");
        script.append("                            result = {}\n");
        script.append("                            for i, param_name in enumerate(param_names):\n");
        script.append("                                result[param_name] = test_case[i]\n\n");
        
        script.append("                            # Output as JSON\n");
        script.append("                            print(json.dumps(result))\n");
        script.append("                            return\n\n");
        
        script.append("    print('Error: No parametrize decorator found')\n");
        script.append("    sys.exit(1)\n\n");
        
        script.append("if __name__ == '__main__':\n");
        script.append("    extract_test_case('").append(testFilePath.replace("\\", "\\\\")).append("', ").append(testCaseIndex).append(")\n");
        
        return script.toString();
    }
    
    private String createCounterScript(String testFilePath) {
        StringBuilder script = new StringBuilder();
        script.append("import ast\n");
        script.append("import sys\n\n");
        
        script.append("def count_test_cases(filename):\n");
        script.append("    with open(filename, 'r') as f:\n");
        script.append("        tree = ast.parse(f.read())\n\n");
        
        script.append("    for node in ast.walk(tree):\n");
        script.append("        if isinstance(node, ast.FunctionDef):\n");
        script.append("            for decorator in node.decorator_list:\n");
        script.append("                if isinstance(decorator, ast.Call):\n");
        script.append("                    if isinstance(decorator.func, ast.Attribute):\n");
        script.append("                        if decorator.func.attr == 'parametrize':\n");
        script.append("                            test_cases = ast.literal_eval(decorator.args[1])\n");
        script.append("                            print(len(test_cases))\n");
        script.append("                            return\n\n");
        
        script.append("    print('0')\n\n");
        
        script.append("if __name__ == '__main__':\n");
        script.append("    count_test_cases('").append(testFilePath.replace("\\", "\\\\")).append("')\n");
        
        return script.toString();
    }
    
    private TestCase parseTestCaseOutput(String output) throws Exception {
        try {
            output = output.trim();
            
            // Parse as JSON-like format
            Map<String, Object> params = new LinkedHashMap<>();
            
            // Simple JSON parsing (we can use a library if needed, but let's keep it simple)
            output = output.substring(1, output.length() - 1); // Remove outer braces
            
            // Split by comma at top level (handling nested structures)
            List<String> parts = splitJsonPairs(output);
            
            for (String part : parts) {
                String[] keyValue = part.split(":", 2);
                if (keyValue.length == 2) {
                    String key = keyValue[0].trim().replace("\"", "");
                    String value = keyValue[1].trim();
                    params.put(key, value);
                }
            }
            
            return new TestCase(params);
            
        } catch (Exception e) {
            throw new Exception("Failed to parse test case output: " + e.getMessage());
        }
    }
    
    private List<String> splitJsonPairs(String json) {
        List<String> parts = new ArrayList<>();
        int depth = 0;
        int start = 0;
        
        for (int i = 0; i < json.length(); i++) {
            char c = json.charAt(i);
            
            if (c == '[' || c == '{') {
                depth++;
            } else if (c == ']' || c == '}') {
                depth--;
            } else if (c == ',' && depth == 0) {
                parts.add(json.substring(start, i));
                start = i + 1;
            }
        }
        
        if (start < json.length()) {
            parts.add(json.substring(start));
        }
        
        return parts;
    }
    
    public static class TestCase {
        private final Map<String, Object> parameters;
        
        public TestCase(Map<String, Object> parameters) {
            this.parameters = parameters;
        }
        
        public Map<String, Object> getParameters() {
            return parameters;
        }
        
        public Object getParameter(String name) {
            return parameters.get(name);
        }
    }
}
