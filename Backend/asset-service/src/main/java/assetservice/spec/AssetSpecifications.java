package com.assets.assetservice.spec;

import com.assets.assetservice.domain.AssetStatus;
import com.assets.assetservice.entity.Asset;
import org.springframework.data.jpa.domain.Specification;

public final class AssetSpecifications {
    private AssetSpecifications() {}

    public static Specification<Asset> hasStatus(AssetStatus s) {
        return (r, q, cb) -> s == null ? cb.conjunction() : cb.equal(r.get("status"), s);
    }
    public static Specification<Asset> hasCategory(String c) {
        return (r, q, cb) -> (c == null || c.isBlank()) ? cb.conjunction() : cb.equal(cb.lower(r.get("category")), c.toLowerCase());
    }
    public static Specification<Asset> search(String q) {
        return (root, query, cb) -> {
            if (q == null || q.isBlank()) return cb.conjunction();
            String like = "%" + q.toLowerCase() + "%";
            return cb.or(
                    cb.like(cb.lower(root.get("name")), like),
                    cb.like(cb.lower(root.get("assetTag")), like),
                    cb.like(cb.lower(root.get("serialNumber")), like)
            );
        };
    }
}
