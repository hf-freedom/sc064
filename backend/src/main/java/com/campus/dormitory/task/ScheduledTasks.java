package com.campus.dormitory.task;

import com.campus.dormitory.service.MaintenanceService;
import com.campus.dormitory.service.UtilityBillService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
public class ScheduledTasks {

    @Autowired
    private UtilityBillService utilityBillService;

    @Autowired
    private MaintenanceService maintenanceService;

    @Scheduled(cron = "0 0 2 1 * ?")
    public void generateMonthlyBills() {
        utilityBillService.generateMonthlyBills();
    }

    @Scheduled(cron = "0 0 3 * * ?")
    public void checkOverdueBills() {
        utilityBillService.checkOverdueBills();
    }

    @Scheduled(cron = "0 0 * * * ?")
    public void checkMaintenanceEscalation() {
        maintenanceService.checkAndEscalateRequests();
    }
}
