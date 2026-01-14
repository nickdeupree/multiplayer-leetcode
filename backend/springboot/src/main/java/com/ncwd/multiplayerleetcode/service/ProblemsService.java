package com.ncwd.multiplayerleetcode.service;

import org.springframework.stereotype.Service;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;
import java.util.stream.Stream;

@Service
public class ProblemsService {
    
    // Use a relative path so it works when running from the project root
    public static final String problemsPath = "lcpy/problems";

    public List<String> getAllProblems() {
        try (Stream<Path> paths = Files.list(Paths.get(problemsPath))) {
            return paths
                    .filter(Files::isDirectory)
                    .map(Path::getFileName)
                    .map(Path::toString)
                    .sorted()
                    .collect(Collectors.toList());
        } catch (IOException e) {
            e.printStackTrace();
            return Collections.emptyList();
        }   
    }

    public String getProblemDescription(String problemSlug) {
        try {
            Path descriptionPath = Paths.get(problemsPath, problemSlug, "README.md");
            return Files.readString(descriptionPath, StandardCharsets.UTF_8);
        } catch (IOException e) {
            e.printStackTrace();
            return "Description not available.";
        }
    }

    public String getProblemTemplate(String problemSlug) {
        try {
            Path templatePath = Paths.get(problemsPath, problemSlug, "solution.py");
            return Files.readString(templatePath, StandardCharsets.UTF_8);
        } catch (IOException e) {
            e.printStackTrace();
            return "Template not available.";
        }
    }
}
