package com.campus.dormitory.controller;

import com.campus.dormitory.common.Result;
import com.campus.dormitory.dto.CheckOutRequest;
import com.campus.dormitory.entity.Student;
import com.campus.dormitory.service.CheckOutService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/checkout")
public class CheckOutController {

    @Autowired
    private CheckOutService checkOutService;

    @PostMapping
    public Result<Student> checkOut(@RequestBody CheckOutRequest request) {
        return checkOutService.checkOut(request);
    }
}
