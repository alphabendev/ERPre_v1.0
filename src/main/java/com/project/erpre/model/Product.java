package com.project.erpre.model;

import com.fasterxml.jackson.annotation.*;
import lombok.*;

import javax.persistence.*;
import java.math.BigDecimal;
import java.sql.Timestamp;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "m_product")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
@ToString
@JsonIdentityInfo(generator = ObjectIdGenerators.PropertyGenerator.class, property = "productCd")
public class Product {

    @Id
    @Column(name = "product_cd", length = 10, nullable = false)
    private String productCd;

    @ManyToOne
    @JsonManagedReference
    @JoinColumn(name = "category_no", foreignKey = @ForeignKey(ConstraintMode.NO_CONSTRAINT))
    @JsonIgnore
    private Category category;  // Category information (foreign key to m_category table)

    @Column(name = "product_nm", length = 100, nullable = false)
    private String productNm;

    @Column(name = "product_insert_date", nullable = false, updatable = false, columnDefinition = "TIMESTAMP DEFAULT CURRENT_TIMESTAMP")
    private LocalDateTime productInsertDate;

    @Column(name = "product_update_date")
    private LocalDateTime productUpdateDate;

    @Column(name = "product_delete_yn", length = 20, nullable = false, columnDefinition = "VARCHAR(20) DEFAULT 'N'")
    private String productDeleteYn; // Deletion status, default 'N'

    @Column(name = "product_delete_date")
    private Timestamp productDeleteDate; // Deletion timestamp

    @Column(name = "product_price", nullable = false, precision = 15, scale = 2)
    private BigDecimal productPrice; // Product price

    @PrePersist
    public void prePersist() {
        this.productInsertDate = LocalDateTime.now();
        if (this.productDeleteYn == null) {
            this.productDeleteYn = "N";
        }
    }

    @PreUpdate
    public void preUpdate() {
        this.productUpdateDate = LocalDateTime.now();
    }

    @ToString.Exclude
    @OneToMany(mappedBy = "product", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnore
    private List<Price> prices;  // List of price entries associated with the product

    @ToString.Exclude
    @JsonIgnore
    @OneToMany(mappedBy = "product", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<OrderDetail> orderDetails;  // List of order details associated with the product
}
