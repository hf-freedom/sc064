package com.campus.dormitory.store;

import com.campus.dormitory.entity.*;
import com.campus.dormitory.enums.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.UUID;

@Component
public class DataInitializer implements CommandLineRunner {

    @Autowired
    private DataStore dataStore;

    @Override
    public void run(String... args) {
        initializeMaintenanceStaff();
        initializeBuildings();
        initializeRoomsAndBeds();
        initializeStudents();
    }

    private void initializeMaintenanceStaff() {
        MaintenanceStaff staff1 = new MaintenanceStaff();
        staff1.setStaffId("STF001");
        staff1.setName("张电工");
        staff1.setPhone("13800138001");
        staff1.setSpecialties(Arrays.asList(MaintenanceType.ELECTRICAL, MaintenanceType.LIGHTING, MaintenanceType.AIR_CONDITIONING));
        staff1.setAvailable(true);
        staff1.setCurrentTaskCount(0);
        dataStore.getMaintenanceStaffs().put(staff1.getStaffId(), staff1);
        dataStore.getStaffRequestMap().put(staff1.getStaffId(), new ArrayList<>());

        MaintenanceStaff staff2 = new MaintenanceStaff();
        staff2.setStaffId("STF002");
        staff2.setName("李水管");
        staff2.setPhone("13800138002");
        staff2.setSpecialties(Arrays.asList(MaintenanceType.PLUMBING, MaintenanceType.DOOR_LOCK));
        staff2.setAvailable(true);
        staff2.setCurrentTaskCount(0);
        dataStore.getMaintenanceStaffs().put(staff2.getStaffId(), staff2);
        dataStore.getStaffRequestMap().put(staff2.getStaffId(), new ArrayList<>());

        MaintenanceStaff staff3 = new MaintenanceStaff();
        staff3.setStaffId("STF003");
        staff3.setName("王木匠");
        staff3.setPhone("13800138003");
        staff3.setSpecialties(Arrays.asList(MaintenanceType.FURNITURE, MaintenanceType.OTHER));
        staff3.setAvailable(true);
        staff3.setCurrentTaskCount(0);
        dataStore.getMaintenanceStaffs().put(staff3.getStaffId(), staff3);
        dataStore.getStaffRequestMap().put(staff3.getStaffId(), new ArrayList<>());
    }

    private void initializeBuildings() {
        DormitoryBuilding building1 = new DormitoryBuilding();
        building1.setBuildingId("BLD001");
        building1.setBuildingName("男生宿舍1号楼");
        building1.setGenderRestriction(Gender.MALE);
        building1.setFloorCount(6);
        building1.setFloors(Arrays.asList(1, 2, 3, 4, 5, 6));
        building1.setDescription("男生宿舍楼，共6层");
        dataStore.getBuildings().put(building1.getBuildingId(), building1);
        dataStore.getBuildingRoomMap().put(building1.getBuildingId(), new ArrayList<>());

        DormitoryBuilding building2 = new DormitoryBuilding();
        building2.setBuildingId("BLD002");
        building2.setBuildingName("女生宿舍1号楼");
        building2.setGenderRestriction(Gender.FEMALE);
        building2.setFloorCount(6);
        building2.setFloors(Arrays.asList(1, 2, 3, 4, 5, 6));
        building2.setDescription("女生宿舍楼，共6层");
        dataStore.getBuildings().put(building2.getBuildingId(), building2);
        dataStore.getBuildingRoomMap().put(building2.getBuildingId(), new ArrayList<>());

        DormitoryBuilding building3 = new DormitoryBuilding();
        building3.setBuildingId("BLD003");
        building3.setBuildingName("男生宿舍2号楼");
        building3.setGenderRestriction(Gender.MALE);
        building3.setFloorCount(5);
        building3.setFloors(Arrays.asList(1, 2, 3, 4, 5));
        building3.setDescription("男生宿舍楼，共5层");
        dataStore.getBuildings().put(building3.getBuildingId(), building3);
        dataStore.getBuildingRoomMap().put(building3.getBuildingId(), new ArrayList<>());
    }

    private void initializeRoomsAndBeds() {
        for (int floor = 1; floor <= 6; floor++) {
            for (int roomNum = 1; roomNum <= 10; roomNum++) {
                String roomId = "BLD001-R" + String.format("%02d", floor) + String.format("%02d", roomNum);
                DormitoryRoom room = new DormitoryRoom();
                room.setRoomId(roomId);
                room.setBuildingId("BLD001");
                room.setFloor(floor);
                room.setRoomNumber(String.format("%02d%02d", floor, roomNum));
                room.setBedCount(4);
                room.setBedIds(new ArrayList<>());
                room.setLastMeterReadingDate(LocalDate.now().minusMonths(1).toString());
                dataStore.getRooms().put(roomId, room);
                dataStore.getBuildingRoomMap().get("BLD001").add(roomId);
                dataStore.getRoomBedMap().put(roomId, new ArrayList<>());

                for (int bedNum = 1; bedNum <= 4; bedNum++) {
                    String bedId = roomId + "-B" + bedNum;
                    Bed bed = new Bed();
                    bed.setBedId(bedId);
                    bed.setRoomId(roomId);
                    bed.setBuildingId("BLD001");
                    bed.setBedNumber(room.getRoomNumber() + "-" + bedNum);
                    bed.setStatus(BedStatus.AVAILABLE);
                    bed.setGenderRestriction(Gender.MALE);
                    bed.setStudentId(null);
                    dataStore.getBeds().put(bedId, bed);
                    room.getBedIds().add(bedId);
                    dataStore.getRoomBedMap().get(roomId).add(bedId);
                }
            }
        }

        for (int floor = 1; floor <= 6; floor++) {
            for (int roomNum = 1; roomNum <= 10; roomNum++) {
                String roomId = "BLD002-R" + String.format("%02d", floor) + String.format("%02d", roomNum);
                DormitoryRoom room = new DormitoryRoom();
                room.setRoomId(roomId);
                room.setBuildingId("BLD002");
                room.setFloor(floor);
                room.setRoomNumber(String.format("%02d%02d", floor, roomNum));
                room.setBedCount(4);
                room.setBedIds(new ArrayList<>());
                room.setLastMeterReadingDate(LocalDate.now().minusMonths(1).toString());
                dataStore.getRooms().put(roomId, room);
                dataStore.getBuildingRoomMap().get("BLD002").add(roomId);
                dataStore.getRoomBedMap().put(roomId, new ArrayList<>());

                for (int bedNum = 1; bedNum <= 4; bedNum++) {
                    String bedId = roomId + "-B" + bedNum;
                    Bed bed = new Bed();
                    bed.setBedId(bedId);
                    bed.setRoomId(roomId);
                    bed.setBuildingId("BLD002");
                    bed.setBedNumber(room.getRoomNumber() + "-" + bedNum);
                    bed.setStatus(BedStatus.AVAILABLE);
                    bed.setGenderRestriction(Gender.FEMALE);
                    bed.setStudentId(null);
                    dataStore.getBeds().put(bedId, bed);
                    room.getBedIds().add(bedId);
                    dataStore.getRoomBedMap().get(roomId).add(bedId);
                }
            }
        }

        for (int floor = 1; floor <= 5; floor++) {
            for (int roomNum = 1; roomNum <= 8; roomNum++) {
                String roomId = "BLD003-R" + String.format("%02d", floor) + String.format("%02d", roomNum);
                DormitoryRoom room = new DormitoryRoom();
                room.setRoomId(roomId);
                room.setBuildingId("BLD003");
                room.setFloor(floor);
                room.setRoomNumber(String.format("%02d%02d", floor, roomNum));
                room.setBedCount(4);
                room.setBedIds(new ArrayList<>());
                room.setLastMeterReadingDate(LocalDate.now().minusMonths(1).toString());
                dataStore.getRooms().put(roomId, room);
                dataStore.getBuildingRoomMap().get("BLD003").add(roomId);
                dataStore.getRoomBedMap().put(roomId, new ArrayList<>());

                for (int bedNum = 1; bedNum <= 4; bedNum++) {
                    String bedId = roomId + "-B" + bedNum;
                    Bed bed = new Bed();
                    bed.setBedId(bedId);
                    bed.setRoomId(roomId);
                    bed.setBuildingId("BLD003");
                    bed.setBedNumber(room.getRoomNumber() + "-" + bedNum);
                    bed.setStatus(BedStatus.AVAILABLE);
                    bed.setGenderRestriction(Gender.MALE);
                    bed.setStudentId(null);
                    dataStore.getBeds().put(bedId, bed);
                    room.getBedIds().add(bedId);
                    dataStore.getRoomBedMap().get(roomId).add(bedId);
                }
            }
        }
    }

    private void initializeStudents() {
        Student student1 = new Student();
        student1.setStudentId("STU2023001");
        student1.setName("张三");
        student1.setGender(Gender.MALE);
        student1.setCollege("计算机学院");
        student1.setGrade(2023);
        student1.setPhone("13900139001");
        student1.setAccommodationStatus(AccommodationStatus.NOT_ACCOMMODATED);
        student1.setArrearsStatus(ArrearsStatus.NO_ARREARS);
        student1.setCurrentBedId(null);
        student1.setDisciplineCount(0);
        student1.setCheckInDate(null);
        dataStore.getStudents().put(student1.getStudentId(), student1);
        dataStore.getStudentBillMap().put(student1.getStudentId(), new ArrayList<>());
        dataStore.getStudentDisciplineMap().put(student1.getStudentId(), new ArrayList<>());

        Student student2 = new Student();
        student2.setStudentId("STU2023002");
        student2.setName("李四");
        student2.setGender(Gender.MALE);
        student2.setCollege("计算机学院");
        student2.setGrade(2023);
        student2.setPhone("13900139002");
        student2.setAccommodationStatus(AccommodationStatus.NOT_ACCOMMODATED);
        student2.setArrearsStatus(ArrearsStatus.NO_ARREARS);
        student2.setCurrentBedId(null);
        student2.setDisciplineCount(0);
        student2.setCheckInDate(null);
        dataStore.getStudents().put(student2.getStudentId(), student2);
        dataStore.getStudentBillMap().put(student2.getStudentId(), new ArrayList<>());
        dataStore.getStudentDisciplineMap().put(student2.getStudentId(), new ArrayList<>());

        Student student3 = new Student();
        student3.setStudentId("STU2023003");
        student3.setName("王五");
        student3.setGender(Gender.MALE);
        student3.setCollege("电子工程学院");
        student3.setGrade(2023);
        student3.setPhone("13900139003");
        student3.setAccommodationStatus(AccommodationStatus.NOT_ACCOMMODATED);
        student3.setArrearsStatus(ArrearsStatus.NO_ARREARS);
        student3.setCurrentBedId(null);
        student3.setDisciplineCount(0);
        student3.setCheckInDate(null);
        dataStore.getStudents().put(student3.getStudentId(), student3);
        dataStore.getStudentBillMap().put(student3.getStudentId(), new ArrayList<>());
        dataStore.getStudentDisciplineMap().put(student3.getStudentId(), new ArrayList<>());

        Student student4 = new Student();
        student4.setStudentId("STU2023004");
        student4.setName("赵六");
        student4.setGender(Gender.FEMALE);
        student4.setCollege("外国语学院");
        student4.setGrade(2023);
        student4.setPhone("13900139004");
        student4.setAccommodationStatus(AccommodationStatus.NOT_ACCOMMODATED);
        student4.setArrearsStatus(ArrearsStatus.NO_ARREARS);
        student4.setCurrentBedId(null);
        student4.setDisciplineCount(0);
        student4.setCheckInDate(null);
        dataStore.getStudents().put(student4.getStudentId(), student4);
        dataStore.getStudentBillMap().put(student4.getStudentId(), new ArrayList<>());
        dataStore.getStudentDisciplineMap().put(student4.getStudentId(), new ArrayList<>());

        Student student5 = new Student();
        student5.setStudentId("STU2022001");
        student5.setName("陈七");
        student5.setGender(Gender.MALE);
        student5.setCollege("机械工程学院");
        student5.setGrade(2022);
        student5.setPhone("13900139005");
        student5.setAccommodationStatus(AccommodationStatus.NOT_ACCOMMODATED);
        student5.setArrearsStatus(ArrearsStatus.NO_ARREARS);
        student5.setCurrentBedId(null);
        student5.setDisciplineCount(1);
        student5.setCheckInDate(null);
        dataStore.getStudents().put(student5.getStudentId(), student5);
        dataStore.getStudentBillMap().put(student5.getStudentId(), new ArrayList<>());
        dataStore.getStudentDisciplineMap().put(student5.getStudentId(), new ArrayList<>());

        DisciplineRecord record1 = new DisciplineRecord();
        record1.setRecordId("DR" + UUID.randomUUID().toString().substring(0, 8));
        record1.setStudentId(student5.getStudentId());
        record1.setBedId(null);
        record1.setRoomId(null);
        record1.setViolationType("晚归");
        record1.setDescription("2023年10月15日晚归");
        record1.setViolationDate(LocalDate.of(2023, 10, 15));
        record1.setPenalty("口头警告");
        dataStore.getDisciplineRecords().put(record1.getRecordId(), record1);
        dataStore.getStudentDisciplineMap().get(student5.getStudentId()).add(record1.getRecordId());
    }
}
