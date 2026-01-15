package com.ncwd.multiplayerleetcode.service;

import org.springframework.stereotype.Service;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Arrays;
import java.util.List;

@Service
public class CodeSecurityValidator {
    
    private static final String PYTHON_VENV_PATH = "lcpy/venv/Scripts/python.exe";
    private static final List<String> BLOCKED_IMPORTS = Arrays.asList(
        "os", "subprocess", "sys", "open", "pathlib", "shutil", 
        "socket", "urllib", "eval", "exec", "__import__"
    );

    /**
     * Validates Python code for security issues using AST parsing
     * @param code The Python code to validate
     * @return ValidationResult containing isValid flag and error messages
     */
    public ValidationResult validate(String code) {
        try {
            // Create a temporary Python file for validation
            Path tempFile = Files.createTempFile("code_validation_", ".py");
            Files.writeString(tempFile, code);
            
            // Create Python validation script
            String validationScript = createValidationScript(tempFile.toString());
            Path scriptFile = Files.createTempFile("validator_", ".py");
            Files.writeString(scriptFile, validationScript);
            
            // Execute validation script using venv Python
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
            Files.deleteIfExists(tempFile);
            Files.deleteIfExists(scriptFile);
            
            if (exitCode != 0) {
                return new ValidationResult(false, output.toString().trim());
            }
            
            return new ValidationResult(true, null);
            
        } catch (Exception e) {
            return new ValidationResult(false, "Validation error: " + e.getMessage());
        }
    }
    
    private String createValidationScript(String codeFilePath) {
        StringBuilder script = new StringBuilder();
        script.append("import ast\n");
        script.append("import sys\n\n");
        
        script.append("BLOCKED_IMPORTS = ").append(BLOCKED_IMPORTS.toString().replace("[", "[\"").replace("]", "\"]").replace(", ", "\", \"")).append("\n\n");
        
        script.append("def validate_code(filename):\n");
        script.append("    try:\n");
        script.append("        with open(filename, 'r') as f:\n");
        script.append("            code = f.read()\n");
        script.append("        tree = ast.parse(code)\n");
        script.append("    except SyntaxError as e:\n");
        script.append("        print(f'Syntax error: {e}')\n");
        script.append("        sys.exit(1)\n\n");
        
        script.append("    for node in ast.walk(tree):\n");
        script.append("        # Check for import statements\n");
        script.append("        if isinstance(node, ast.Import):\n");
        script.append("            for alias in node.names:\n");
        script.append("                module = alias.name.split('.')[0]\n");
        script.append("                if module in BLOCKED_IMPORTS:\n");
        script.append("                    print(f'Security violation: Import of \\\"{module}\\\" is not allowed')\n");
        script.append("                    sys.exit(1)\n\n");
        
        script.append("        # Check for from-import statements\n");
        script.append("        if isinstance(node, ast.ImportFrom):\n");
        script.append("            if node.module:\n");
        script.append("                module = node.module.split('.')[0]\n");
        script.append("                if module in BLOCKED_IMPORTS:\n");
        script.append("                    print(f'Security violation: Import from \\\"{module}\\\" is not allowed')\n");
        script.append("                    sys.exit(1)\n\n");
        
        script.append("        # Check for eval/exec calls\n");
        script.append("        if isinstance(node, ast.Call):\n");
        script.append("            if isinstance(node.func, ast.Name):\n");
        script.append("                if node.func.id in ['eval', 'exec', '__import__', 'open']:\n");
        script.append("                    print(f'Security violation: Use of \\\"{node.func.id}\\\" is not allowed')\n");
        script.append("                    sys.exit(1)\n\n");
        
        script.append("    print('Valid')\n");
        script.append("    sys.exit(0)\n\n");
        
        script.append("if __name__ == '__main__':\n");
        script.append("    validate_code('").append(codeFilePath.replace("\\", "\\\\")).append("')\n");
        
        return script.toString();
    }
    
    public static class ValidationResult {
        private final boolean valid;
        private final String errorMessage;
        
        public ValidationResult(boolean valid, String errorMessage) {
            this.valid = valid;
            this.errorMessage = errorMessage;
        }
        
        public boolean isValid() {
            return valid;
        }
        
        public String getErrorMessage() {
            return errorMessage;
        }
    }
}
