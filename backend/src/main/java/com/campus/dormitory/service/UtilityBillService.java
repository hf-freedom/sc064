package com.campus.dormitory.service;

import com.campus.dormitory.common.Result;
import com.campus.dormitory.dto.PayBillRequest;
import com.campus.dormitory.entity.Bed;
import com.campus.dormitory.entity.DormitoryRoom;
import com.campus.dormitory.entity.Student;
import com.campus.dormitory.entity.UtilityBill;
import com.campus.dormitory.enums.ArrearsStatus;
import com.campus.dormitory.enums.BedStatus;
import com.campus.dormitory.enums.BillStatus;
import com.campus.dormitory.store.DataStore;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Random;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class UtilityBillService {

    private static final BigDecimal ELECTRICITY_PRICE = new BigDecimal("0.65");
    private static final BigDecimal WATER_PRICE = new BigDecimal("3.50");
    private static final int DUE_DAYS = 15;

    @Autowired
    private DataStore dataStore;

    @Autowired
    private AccessCardService accessCardService;

    public void generateMonthlyBills() {
        LocalDate now = LocalDate.now();
        int billingYear = now.minusMonths(1).getYear();
        int billingMonth = now.minusMonths(1).getMonthValue();

        for (DormitoryRoom room : dataStore.getRooms().values()) {
            generateRoomBills(room, billingYear, billingMonth);
        }
    }

    private void generateRoomBills(DormitoryRoom room, int year, int month) {
        List<String> occupiedBeds = room.getBedIds().stream()
                .map(bedId -> dataStore.getBeds().get(bedId))
                .filter(bed -> bed != null && bed.getStatus() == BedStatus.OCCUPIED)
                .map(bed -> bed.getBedId())
                .collect(Collectors.toList());

        if (occupiedBeds.isEmpty()) {
            return;
        }

        int studentCount = occupiedBeds.size();

        Random random = new Random();
        BigDecimal totalElectricity = BigDecimal.valueOf(50 + random.nextInt(100));
        BigDecimal totalWater = BigDecimal.valueOf(10 + random.nextInt(20));

        BigDecimal electricityPerStudent = totalElectricity.divide(BigDecimal.valueOf(studentCount), 2, RoundingMode.HALF_UP);
        BigDecimal waterPerStudent = totalWater.divide(BigDecimal.valueOf(studentCount), 2, RoundingMode.HALF_UP);

        BigDecimal electricityCostPerStudent = electricityPerStudent.multiply(ELECTRICITY_PRICE).setScale(2, RoundingMode.HALF_UP);
        BigDecimal waterCostPerStudent = waterPerStudent.multiply(WATER_PRICE).setScale(2, RoundingMode.HALF_UP);
        BigDecimal totalCostPerStudent = electricityCostPerStudent.add(waterCostPerStudent);

        LocalDate dueDate = LocalDate.of(year, month, 1).plusMonths(1).plusDays(DUE_DAYS);

        for (String bedId : occupiedBeds) {
            Bed bed = dataStore.getBeds().get(bedId);
            if (bed == null || bed.getStudentId() == null) continue;

            String studentId = bed.getStudentId();

            boolean exists = dataStore.getUtilityBills().values().stream()
                    .anyMatch(bill -> bill.getStudentId().equals(studentId) &&
                            bill.getBillingYear() == year &&
                            bill.getBillingMonth() == month);
            if (exists) continue;

            UtilityBill bill = new UtilityBill();
            bill.setBillId("BILL" + UUID.randomUUID().toString().substring(0, 8).toUpperCase());
            bill.setStudentId(studentId);
            bill.setRoomId(room.getRoomId());
            bill.setBedId(bedId);
            bill.setBillingMonth(month);
            bill.setBillingYear(year);
            bill.setElectricityUsage(electricityPerStudent);
            bill.setWaterUsage(waterPerStudent);
            bill.setElectricityCost(electricityCostPerStudent);
            bill.setWaterCost(waterCostPerStudent);
            bill.setTotalAmount(totalCostPerStudent);
            bill.setStatus(BillStatus.PENDING);
            bill.setDueDate(dueDate);
            bill.setGeneratedDate(LocalDate.now());

            dataStore.getUtilityBills().put(bill.getBillId(), bill);

            if (!dataStore.getStudentBillMap().containsKey(studentId)) {
                dataStore.getStudentBillMap().put(studentId, new ArrayList<>());
            }
            dataStore.getStudentBillMap().get(studentId).add(bill.getBillId());
        }
    }

    public Result<List<UtilityBill>> getBillsByStudent(String studentId) {
        List<String> billIds = dataStore.getStudentBillMap().get(studentId);
        if (billIds == null || billIds.isEmpty()) {
            return Result.success(new ArrayList<>());
        }
        List<UtilityBill> bills = billIds.stream()
                .map(id -> dataStore.getUtilityBills().get(id))
                .collect(Collectors.toList());
        return Result.success(bills);
    }

    public Result<UtilityBill> getBillById(String billId) {
        UtilityBill bill = dataStore.getUtilityBills().get(billId);
        if (bill == null) {
            return Result.error("账单不存在");
        }
        return Result.success(bill);
    }

    public Result<UtilityBill> payBill(PayBillRequest request) {
        UtilityBill bill = dataStore.getUtilityBills().get(request.getBillId());
        if (bill == null) {
            return Result.error("账单不存在");
        }

        if (bill.getStatus() == BillStatus.PAID) {
            return Result.error("账单已支付");
        }

        bill.setStatus(BillStatus.PAID);
        bill.setPaidDate(LocalDate.now());
        dataStore.getUtilityBills().put(bill.getBillId(), bill);

        updateStudentArrearsStatus(bill.getStudentId());

        return Result.success("账单支付成功", bill);
    }

    public void checkOverdueBills() {
        LocalDate today = LocalDate.now();
        for (UtilityBill bill : dataStore.getUtilityBills().values()) {
            if (bill.getStatus() == BillStatus.PENDING &&
                    bill.getDueDate() != null &&
                    today.isAfter(bill.getDueDate())) {
                bill.setStatus(BillStatus.OVERDUE);
                dataStore.getUtilityBills().put(bill.getBillId(), bill);
            }
        }

        for (Student student : dataStore.getStudents().values()) {
            updateStudentArrearsStatus(student.getStudentId());
        }
    }

    private void updateStudentArrearsStatus(String studentId) {
        Student student = dataStore.getStudents().get(studentId);
        if (student == null) return;

        List<String> billIds = dataStore.getStudentBillMap().get(studentId);
        if (billIds == null || billIds.isEmpty()) {
            student.setArrearsStatus(ArrearsStatus.NO_ARREARS);
            accessCardService.restoreAccessCard(studentId);
            return;
        }

        boolean hasOverdue = billIds.stream()
                .map(id -> dataStore.getUtilityBills().get(id))
                .anyMatch(bill -> bill != null && bill.getStatus() == BillStatus.OVERDUE);

        boolean hasPending = billIds.stream()
                .map(id -> dataStore.getUtilityBills().get(id))
                .anyMatch(bill -> bill != null && bill.getStatus() == BillStatus.PENDING);

        if (hasOverdue) {
            student.setArrearsStatus(ArrearsStatus.OVERDUE_ARREARS);
            accessCardService.restrictAccessCard(studentId);
        } else if (hasPending) {
            student.setArrearsStatus(ArrearsStatus.ARREARS);
        } else {
            student.setArrearsStatus(ArrearsStatus.NO_ARREARS);
            accessCardService.restoreAccessCard(studentId);
        }

        dataStore.getStudents().put(studentId, student);
    }

    public Result<List<UtilityBill>> getAllBills() {
        List<UtilityBill> bills = dataStore.getUtilityBills().values().stream()
                .collect(Collectors.toList());
        return Result.success(bills);
    }

    public boolean hasOutstandingBills(String studentId) {
        List<String> billIds = dataStore.getStudentBillMap().get(studentId);
        if (billIds == null || billIds.isEmpty()) {
            return false;
        }
        return billIds.stream()
                .map(id -> dataStore.getUtilityBills().get(id))
                .anyMatch(bill -> bill != null &&
                        (bill.getStatus() == BillStatus.PENDING || bill.getStatus() == BillStatus.OVERDUE));
    }
}
