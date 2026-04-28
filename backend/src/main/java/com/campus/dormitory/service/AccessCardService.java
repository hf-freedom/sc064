package com.campus.dormitory.service;

import com.campus.dormitory.common.Result;
import com.campus.dormitory.entity.AccessCard;
import com.campus.dormitory.entity.Student;
import com.campus.dormitory.enums.AccessStatus;
import com.campus.dormitory.store.DataStore;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class AccessCardService {

    @Autowired
    private DataStore dataStore;

    public AccessCard createAccessCard(String studentId, String bedId, String buildingId) {
        AccessCard card = new AccessCard();
        card.setCardId("CARD" + UUID.randomUUID().toString().substring(0, 8).toUpperCase());
        card.setStudentId(studentId);
        card.setBedId(bedId);
        card.setBuildingId(buildingId);
        card.setStatus(AccessStatus.ACTIVE);
        card.setIssueDate(LocalDateTime.now());
        card.setExpiryDate(LocalDateTime.now().plusYears(4));
        dataStore.getAccessCards().put(card.getCardId(), card);
        return card;
    }

    public Result<List<AccessCard>> getAccessCardsByStudent(String studentId) {
        List<AccessCard> cards = dataStore.getAccessCards().values().stream()
                .filter(card -> card.getStudentId().equals(studentId))
                .collect(Collectors.toList());
        return Result.success(cards);
    }

    public Result<AccessCard> getActiveAccessCardByStudent(String studentId) {
        AccessCard activeCard = dataStore.getAccessCards().values().stream()
                .filter(card -> card.getStudentId().equals(studentId))
                .filter(card -> card.getStatus() == AccessStatus.ACTIVE ||
                        card.getStatus() == AccessStatus.RESTRICTED)
                .findFirst()
                .orElse(null);
        if (activeCard == null) {
            return Result.error("学生没有有效的门禁卡");
        }
        return Result.success(activeCard);
    }

    public void restrictAccessCard(String studentId) {
        AccessCard activeCard = dataStore.getAccessCards().values().stream()
                .filter(card -> card.getStudentId().equals(studentId))
                .filter(card -> card.getStatus() == AccessStatus.ACTIVE)
                .findFirst()
                .orElse(null);
        if (activeCard != null) {
            activeCard.setStatus(AccessStatus.RESTRICTED);
            dataStore.getAccessCards().put(activeCard.getCardId(), activeCard);
        }
    }

    public void restoreAccessCard(String studentId) {
        AccessCard restrictedCard = dataStore.getAccessCards().values().stream()
                .filter(card -> card.getStudentId().equals(studentId))
                .filter(card -> card.getStatus() == AccessStatus.RESTRICTED)
                .findFirst()
                .orElse(null);
        if (restrictedCard != null) {
            restrictedCard.setStatus(AccessStatus.ACTIVE);
            dataStore.getAccessCards().put(restrictedCard.getCardId(), restrictedCard);
        }
    }

    public void deactivateAccessCard(String studentId) {
        AccessCard activeCard = dataStore.getAccessCards().values().stream()
                .filter(card -> card.getStudentId().equals(studentId))
                .filter(card -> card.getStatus() == AccessStatus.ACTIVE ||
                        card.getStatus() == AccessStatus.RESTRICTED)
                .findFirst()
                .orElse(null);
        if (activeCard != null) {
            activeCard.setStatus(AccessStatus.INACTIVE);
            dataStore.getAccessCards().put(activeCard.getCardId(), activeCard);
        }
    }

    public Result<AccessCard> transferAccessCard(String studentId, String newBedId, String newBuildingId) {
        AccessCard activeCard = dataStore.getAccessCards().values().stream()
                .filter(card -> card.getStudentId().equals(studentId))
                .filter(card -> card.getStatus() == AccessStatus.ACTIVE ||
                        card.getStatus() == AccessStatus.RESTRICTED)
                .findFirst()
                .orElse(null);
        if (activeCard == null) {
            return Result.error("学生没有有效的门禁卡");
        }
        activeCard.setBedId(newBedId);
        activeCard.setBuildingId(newBuildingId);
        dataStore.getAccessCards().put(activeCard.getCardId(), activeCard);
        return Result.success(activeCard);
    }

    public Result<List<AccessCard>> getAllAccessCards() {
        List<AccessCard> cards = dataStore.getAccessCards().values().stream()
                .collect(Collectors.toList());
        return Result.success(cards);
    }
}
