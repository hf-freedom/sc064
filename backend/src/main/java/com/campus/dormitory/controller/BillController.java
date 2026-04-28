package com.campus.dormitory.controller;

import com.campus.dormitory.common.Result;
import com.campus.dormitory.dto.PayBillRequest;
import com.campus.dormitory.entity.UtilityBill;
import com.campus.dormitory.service.UtilityBillService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/bills")
public class BillController {

    @Autowired
    private UtilityBillService utilityBillService;

    @GetMapping
    public Result<List<UtilityBill>> getAllBills() {
        return utilityBillService.getAllBills();
    }

    @GetMapping("/{billId}")
    public Result<UtilityBill> getBillById(@PathVariable String billId) {
        return utilityBillService.getBillById(billId);
    }

    @GetMapping("/student/{studentId}")
    public Result<List<UtilityBill>> getBillsByStudent(@PathVariable String studentId) {
        return utilityBillService.getBillsByStudent(studentId);
    }

    @PostMapping("/pay")
    public Result<UtilityBill> payBill(@RequestBody PayBillRequest request) {
        return utilityBillService.payBill(request);
    }

    @PostMapping("/generate")
    public Result<String> generateBills() {
        utilityBillService.generateMonthlyBills();
        return Result.success("账单生成成功", null);
    }

    @PostMapping("/check-overdue")
    public Result<String> checkOverdueBills() {
        utilityBillService.checkOverdueBills();
        return Result.success("逾期账单检查完成", null);
    }
}
