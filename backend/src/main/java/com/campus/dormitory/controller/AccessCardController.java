package com.campus.dormitory.controller;

import com.campus.dormitory.common.Result;
import com.campus.dormitory.entity.AccessCard;
import com.campus.dormitory.service.AccessCardService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/access-cards")
public class AccessCardController {

    @Autowired
    private AccessCardService accessCardService;

    @GetMapping
    public Result<List<AccessCard>> getAllAccessCards() {
        return accessCardService.getAllAccessCards();
    }

    @GetMapping("/student/{studentId}")
    public Result<List<AccessCard>> getAccessCardsByStudent(@PathVariable String studentId) {
        return accessCardService.getAccessCardsByStudent(studentId);
    }

    @GetMapping("/student/{studentId}/active")
    public Result<AccessCard> getActiveAccessCard(@PathVariable String studentId) {
        return accessCardService.getActiveAccessCardByStudent(studentId);
    }
}
