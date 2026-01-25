package com.project.erpre.model;

import lombok.*;
import javax.persistence.*;
import java.math.BigDecimal;
import java.sql.Timestamp;
import java.sql.Date;

/**
 * The Price entity maps to the m_price table.
 * It represents pricing information and its relationships to customers and products,
 * managing the applicable period of each price and deletion status.
 */
@Entity
@Table(name = "m_price")  // Maps to the m_price table
@Data
@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
@ToString
public class Price {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "price_no")
    private Integer priceNo;  // Price ID (auto-increment, primary key)

    @ManyToOne
    @JoinColumn(name = "customer_no", nullable = false, foreignKey = @ForeignKey(ConstraintMode.NO_CONSTRAINT))
    private Customer customer;  // Customer information (references m_customer table, foreign key)

    @ManyToOne
    @JoinColumn(name = "product_cd", nullable = false, foreignKey = @ForeignKey(ConstraintMode.NO_CONSTRAINT))
    private Product product;  // Product information (references m_product table, foreign key)

    @Column(name = "price_customer", nullable = false, precision = 15, scale = 2)
    private BigDecimal priceCustomer;  // Customer-specific price (precision 15, scale 2)

    @Column(name = "price_start_date")
    private Date priceStartDate;  // Price start date (if null, applies immediately)

    @Column(name = "price_end_date")
    private Date priceEndDate;  // Price end date (if null, applies indefinitely)

    @Column(name = "price_insert_date", nullable = false, insertable = false, updatable = false)
    private Timestamp priceInsertDate;  // Price registration timestamp (automatically set by database using CURRENT_TIMESTAMP)

    @Column(name = "price_update_date")
    private Timestamp priceUpdateDate;  // Price update timestamp (updated on modification)

    @Column(name = "price_delete_yn", length = 20, nullable = false, columnDefinition = "VARCHAR(20) DEFAULT 'N'")
    private String priceDeleteYn = "N";  // Deletion status (default 'N', not deleted)

    @Column(name = "price_delete_date")
    private Timestamp priceDeleteDate;  // Deletion timestamp (set only if deleted)
}
