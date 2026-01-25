package com.project.erpre.model;

import lombok.*;

import java.math.BigDecimal;
import java.sql.Timestamp;
import java.sql.Date;

/**
 * PriceDTO is a Data Transfer Object used for transferring data between client and server.
 * It carries data from the Price entity or is used in business logic that is not directly linked to the database.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
@ToString
public class PriceDTO {

    private Integer priceNo; // Price ID
    private Integer customerNo;  // Customer ID (from m_customer table)
    private String productCd;  // Product code (from m_product table)
    private BigDecimal priceCustomer; // Customer-specific price
    private Date priceStartDate; // Price start date
    private Date priceEndDate; // Price end date
    private Timestamp priceInsertDate; // Price registration timestamp
    private Timestamp priceUpdateDate; // Price update timestamp
    private String priceDeleteYn = "N"; // Deletion status (default 'N')
    private Timestamp priceDeleteDate; // Deletion timestamp

    // Additional information from related entities (not directly linked to Price entity, used for UI)
    private String customerName;  // Customer name (retrieved from m_customer table)
    private String productNm;  // Product name (retrieved from m_product table)
    private String categoryNm;  // Category name (retrieved from m_category table)
    private String categoryPath;  // Category path (retrieved from m_category table)
}
