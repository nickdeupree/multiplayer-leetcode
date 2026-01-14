package com.ncwd.multiplayerleetcode.controller;

import com.ncwd.multiplayerleetcode.service.ProblemsService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import java.util.List;

@RestController
@RequestMapping("/api/problems")
public class ProblemsController {
    private final ProblemsService problemsService;

    public ProblemsController(ProblemsService problemsService) {
        this.problemsService = problemsService;
    }

    @GetMapping("/getAllProblems")
    public List<String> getAllProblems() {
        return problemsService.getAllProblems();
    }

    @GetMapping(value = "/getProblemDescription", produces = MediaType.TEXT_PLAIN_VALUE)
    public ResponseEntity<String> getProblemDescription(@RequestParam String problemSlug) {
        String description = problemsService.getProblemDescription(problemSlug);
        // Normalize CRLF to LF so clients render consistent line breaks
        description = description.replace("\r\n", "\n");
        return ResponseEntity.ok()
                .contentType(MediaType.TEXT_PLAIN)
                .body(description);
    }

    @GetMapping(value = "/getProblemTemplate", produces = MediaType.TEXT_PLAIN_VALUE)
    public ResponseEntity<String> getProblemTemplate(@RequestParam String problemSlug) {
        String template = problemsService.getProblemTemplate(problemSlug);
        // Normalize CRLF to LF so clients render consistent line breaks
        template = template.replace("\r\n", "\n");
        return ResponseEntity.ok()
                .contentType(MediaType.TEXT_PLAIN)
                .body(template);
    }

}
