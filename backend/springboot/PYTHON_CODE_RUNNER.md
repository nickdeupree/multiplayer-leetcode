# Python Code Runner Implementation

This document describes the implementation of the Python code runner system that executes user code against test cases with security validation and timeout controls.

## Architecture Overview

The system consists of three main layers:

1. **Backend (Java/Spring Boot)**: Security validation, test case extraction, and code execution
2. **Frontend (Next.js/React)**: User interface for code editing and result display
3. **Python Execution Environment**: Isolated execution of user code with helper functions

## Backend Components

### 1. CodeSecurityValidator Service
**Location**: `src/main/java/com/ncwd/multiplayerleetcode/service/CodeSecurityValidator.java`

**Purpose**: Validates Python code for security issues before execution

**Features**:
- Uses Python AST (Abstract Syntax Tree) parsing to analyze code
- Blocks dangerous imports: `os`, `subprocess`, `sys`, `open`, `pathlib`, `shutil`, `socket`, `urllib`
- Blocks dangerous functions: `eval`, `exec`, `__import__`, `open`
- Returns validation result with detailed error messages

**Usage**:
```java
ValidationResult result = securityValidator.validate(userCode);
if (!result.isValid()) {
    // Handle security violation
}
```

### 2. TestCaseExtractor Service
**Location**: `src/main/java/com/ncwd/multiplayerleetcode/service/TestCaseExtractor.java`

**Purpose**: Extracts test cases from `test_solution.py` files

**Features**:
- Parses `@pytest.mark.parametrize` decorators using Python AST
- Extracts specific test case by index
- Returns parameter names mapped to their values
- Provides test case count functionality

**Usage**:
```java
TestCase testCase = extractor.extractTestCase("add_two_numbers", 0);
Map<String, Object> params = testCase.getParameters();
```

### 3. CodeExecutionService
**Location**: `src/main/java/com/ncwd/multiplayerleetcode/service/CodeExecutionService.java`

**Purpose**: Executes user code against test cases with timeout control

**Features**:
- Writes user code to temporary `user_solution.py` file
- Generates execution script that imports helpers and runs assertions
- Executes via Java `ProcessBuilder` with 5-second timeout
- Captures stdout/stderr and handles timeouts/errors
- Automatically cleans up temporary files
- Returns structured execution results

**Execution Flow**:
1. Extract test case parameters
2. Write user code to problem directory
3. Generate execution script with helper imports
4. Execute with timeout
5. Parse results (success/failed/error/timeout)
6. Clean up temporary files

### 4. CodeExecutionController (REST API)
**Location**: `src/main/java/com/ncwd/multiplayerleetcode/controller/CodeExecutionController.java`

**Endpoint**: `POST /api/code/run`

**Request Body**:
```json
{
  "problemSlug": "add_two_numbers",
  "code": "class Solution:\n    def add_two_numbers(self, l1, l2):\n        ...",
  "testCaseIndex": 0
}
```

**Response**:
```json
{
  "status": "success",
  "actualOutput": "[7, 0, 8]",
  "expectedOutput": "[7, 0, 8]",
  "errorMessage": null,
  "executionTimeMs": 145
}
```

**Status Values**:
- `success`: Test passed
- `failed`: Test failed (assertion error)
- `error`: Runtime or syntax error
- `timeout`: Execution exceeded 5 seconds

## Frontend Components

### 1. Code Runner Helper
**Location**: `app/helpers/session/code-runner.tsx`

**Function**: `handleRunCode(problemSlug, code, testCaseIndex)`

**Purpose**: Sends code execution request to backend and returns results

**Usage**:
```typescript
const result = await handleRunCode("add_two_numbers", userCode, 0);
console.log(result.status); // "success" | "failed" | "error" | "timeout"
```

### 2. Session Page (State Management)
**Location**: `app/session/page.tsx`

**Features**:
- Manages code editor state
- Tracks selected test case
- Handles run button click
- Manages execution state (loading, results)
- Coordinates between editor and test runner

### 3. Editor Pane
**Location**: `app/components/session/editor-pane.tsx`

**Features**:
- Monaco code editor for Python
- Run button with loading state
- Code change tracking
- Submit button (for future implementation)

### 4. Test Runner Component
**Location**: `app/components/session/test-runner.tsx`

**Features**:
- Displays test cases with input/output
- Shows execution results with visual indicators
- Status badges (Passed/Failed/Error/Timeout)
- Detailed error messages
- Execution time display
- Actual vs Expected output comparison
- Color-coded result panels

**Result Display**:
- ✓ Green panel for success
- ✗ Red panel for failures
- ⏱ Orange panel for timeouts
- Error messages with syntax highlighting

## Python Execution Environment

### Helper Functions
Each problem has a `helpers.py` file with:

1. **run_\* functions**: Execute the user's solution
   ```python
   def run_add_two_numbers(solution_class, l1_vals, l2_vals):
       l1 = ListNode.from_list(l1_vals)
       l2 = ListNode.from_list(l2_vals)
       implementation = solution_class()
       return implementation.add_two_numbers(l1, l2)
   ```

2. **assert_\* functions**: Validate the output
   ```python
   def assert_add_two_numbers(result, expected_vals):
       expected = ListNode.from_list(expected_vals)
       assert result == expected
       return True
   ```

### Type Handling
The system uses `leetcode-py-sdk` for automatic conversion:
- `ListNode.from_list()`: Converts arrays to linked lists
- `TreeNode.from_list()`: Converts arrays to binary trees
- `ListNode.to_list()`: Converts linked lists back to arrays
- Automatic comparison operators for complex types

### Generated Execution Script
The service generates a Python script that:
1. Imports user solution and helpers
2. Parses test case parameters
3. Calls `run_*` function with parameters
4. Runs `assert_*` function to validate
5. Catches and formats errors
6. Outputs JSON-formatted results

## Security Features

1. **AST-based Validation**: Analyzes code structure before execution
2. **Import Blocking**: Prevents dangerous system access
3. **Function Blocking**: Blocks `eval`, `exec`, `open`
4. **Timeout Control**: 5-second execution limit
5. **Isolated Execution**: Each execution in separate process
6. **Temporary Files**: User code written to temp files, deleted immediately

## Setup Requirements

### Python Dependencies
Run the setup script to install required packages:
```bash
python setup_python_env.py
```

Required packages:
- `leetcode-py-sdk`: For ListNode/TreeNode handling
- `pytest`: For test framework (future use)

### Backend Configuration
No additional configuration needed. The system uses relative paths and default settings.

### Frontend Configuration
Set the API base URL (optional):
```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:8080/api
```

## Testing the System

1. **Start the Backend**:
   ```bash
   cd backend/springboot
   ./gradlew bootRun
   ```

2. **Start the Frontend**:
   ```bash
   cd frontend
   npm run dev
   ```

3. **Test Flow**:
   - Navigate to `/session?problemId=add_two_numbers`
   - Write solution in editor
   - Select a test case
   - Click "Run"
   - View results in Results tab

## Example Usage

### Valid Code (Success):
```python
class Solution:
    def add_two_numbers(self, l1: ListNode, l2: ListNode) -> ListNode:
        dummy = ListNode(0)
        current = dummy
        carry = 0
        
        while l1 or l2 or carry:
            val1 = l1.val if l1 else 0
            val2 = l2.val if l2 else 0
            
            total = val1 + val2 + carry
            carry = total // 10
            current.next = ListNode(total % 10)
            
            current = current.next
            l1 = l1.next if l1 else None
            l2 = l2.next if l2 else None
        
        return dummy.next
```

**Result**: ✓ Success with actual output `[7, 0, 8]`

### Invalid Code (Security Violation):
```python
import os
class Solution:
    def add_two_numbers(self, l1, l2):
        os.system("rm -rf /")  # Blocked!
```

**Result**: Error - "Security violation: Import of 'os' is not allowed"

### Error Code:
```python
class Solution:
    def add_two_numbers(self, l1, l2):
        return 1 / 0  # Runtime error
```

**Result**: Error - "ZeroDivisionError: division by zero"

### Timeout Code:
```python
class Solution:
    def add_two_numbers(self, l1, l2):
        while True:  # Infinite loop
            pass
```

**Result**: Timeout - "Execution timed out after 5 seconds"

## Future Enhancements

1. **Multiple Test Case Execution**: Run all test cases at once
2. **Performance Metrics**: Memory usage, detailed timing
3. **Code Analysis**: Complexity analysis, best practices
4. **Submission System**: Save and track submissions
5. **Leaderboard**: Compare execution times
6. **Custom Test Cases**: Allow users to add their own tests
7. **Debugging Tools**: Step-through execution, breakpoints

## Troubleshooting

### Common Issues

1. **"Python not found"**
   - Ensure Python 3 is installed and in PATH
   - Test with: `python --version`

2. **"leetcode-py-sdk not found"**
   - Run: `python setup_python_env.py`
   - Or: `pip install leetcode-py-sdk`

3. **"Test file not found"**
   - Verify problem slug matches directory name
   - Check that `test_solution.py` exists

4. **"Timeout on all executions"**
   - Check Python process isn't hanging
   - Verify ProcessBuilder working directory is correct

5. **"Security validation always fails"**
   - Ensure Python AST module is available
   - Check Python version (requires 3.6+)

## Performance Considerations

- **Execution Time**: Average 100-500ms per test case
- **Memory**: ~50MB per execution process
- **Concurrency**: Each request spawns separate process
- **Cleanup**: Temporary files deleted immediately after execution
- **Scalability**: Consider process pooling for high traffic

## API Rate Limiting (Future)

For production deployment, consider:
- Rate limiting per user/IP
- Maximum concurrent executions
- Queue system for pending executions
- Execution history and caching
