package com.ncwd.multiplayerleetcode.controller;

import com.ncwd.multiplayerleetcode.dto.CodeRunRequest;
import com.ncwd.multiplayerleetcode.dto.CodeRunResponse;
import com.ncwd.multiplayerleetcode.service.CodeExecutionService;
import com.ncwd.multiplayerleetcode.service.CodeSecurityValidator;
import com.ncwd.multiplayerleetcode.service.TestExecutionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/code")
@CrossOrigin(origins = "*")
public class CodeExecutionController {
    
    @Autowired
    private CodeSecurityValidator securityValidator;
    
    @Autowired
    private CodeExecutionService executionService;
    
    @Autowired
    private TestExecutionService testExecutionService;
    
    @PostMapping("/run")
    public ResponseEntity<CodeRunResponse> runCode(@RequestBody CodeRunRequest request) {
        try {
            // Step 1: Validate code security
            CodeSecurityValidator.ValidationResult validationResult = 
                securityValidator.validate(request.getCode());
            
            if (!validationResult.isValid()) {
                CodeRunResponse response = new CodeRunResponse(
                    "error",
                    null,
                    null,
                    "Security validation failed: " + validationResult.getErrorMessage(),
                    0
                );
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
            }
            
            // Step 2: Execute code
            int testCaseIndex = request.getTestCaseIndex() != null ? request.getTestCaseIndex() : 0;
            CodeExecutionService.ExecutionResult result = 
                executionService.executeCode(
                    request.getProblemSlug(), 
                    request.getCode(), 
                    testCaseIndex
                );
            
            // Step 3: Return response
            CodeRunResponse response = new CodeRunResponse(
                result.getStatus(),
                result.getActualOutput(),
                result.getExpectedOutput(),
                result.getErrorMessage(),
                result.getErrorType(),
                result.getTraceback(),
                result.getExecutionTimeMs()
            );
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            CodeRunResponse response = new CodeRunResponse(
                "error",
                null,
                null,
                "Server error: " + e.getMessage(),
                0
            );
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }
    
    @PostMapping("/submit")
    public ResponseEntity<?> submitCode(@RequestBody CodeRunRequest request) {
        try {
            // Step 1: Validate code security
            CodeSecurityValidator.ValidationResult validationResult = 
                securityValidator.validate(request.getCode());
            
            if (!validationResult.isValid()) {
                Map<String, Object> errorResponse = new HashMap<>();
                errorResponse.put("status", "error");
                errorResponse.put("errorMessage", "Security validation failed: " + validationResult.getErrorMessage());
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
            }
            
            // Step 2: Execute all tests
            TestExecutionService.TestExecutionResult result = 
                testExecutionService.executeTests(
                    request.getProblemSlug(), 
                    request.getCode()
                );
            
            // Step 3: Return response
            Map<String, Object> response = new HashMap<>();
            response.put("status", result.getStatus());
            response.put("testCases", result.getTestCases());
            response.put("totalCount", result.getTotalCount());
            response.put("passedCount", result.getPassedCount());
            response.put("failedCount", result.getFailedCount());
            response.put("errorMessage", result.getErrorMessage());
            response.put("executionTimeMs", result.getExecutionTimeMs());
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("status", "error");
            errorResponse.put("errorMessage", "Server error: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }
}
