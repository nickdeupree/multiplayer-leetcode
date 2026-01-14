package com.ncwd.multiplayerleetcode.controller; // Match your actual package path

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class ApiController {

    @GetMapping("/hello")
    public Map<String, String> sayHello() {
        return Map.of("message", "Connected to Spring Boot!");
    }
}