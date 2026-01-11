package Backend.repository;

import Backend.model.InventoryModel;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface InventoryRepository extends JpaRepository<InventoryModel, Long> {
    List<InventoryModel> findByItemNameContainingIgnoreCaseOrItemCategoryContainingIgnoreCase(String name, String category);
}