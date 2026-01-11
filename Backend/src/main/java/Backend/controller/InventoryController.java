package Backend.controller;

import Backend.exception.InventoryNotFoundException;
import Backend.model.HistoryLog;
import Backend.model.InventoryModel;
import Backend.repository.HistoryLogRepository;
import Backend.repository.InventoryRepository;
import Backend.service.EmailService; // Import this
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.FileSystemResource;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.util.List;

@SuppressWarnings("unused")
@RestController
@CrossOrigin("http://localhost:3000")
public class InventoryController {
    @Autowired
    private InventoryRepository inventoryRepository;
    
    @Autowired
    private HistoryLogRepository historyLogRepository;
    
    @Autowired
    private EmailService emailService; // <--- Inject Email Service

    @PostMapping("/inventory")
    @PreAuthorize("hasAuthority('ADMIN')")
    public InventoryModel newInventoryModel(@RequestBody InventoryModel newInventoryModel){
        // 1. Extract the user from the payload (or default to 'System Admin')
        String user = newInventoryModel.getPerformedBy();
        if (user == null || user.isEmpty()) user = "System Admin";

        InventoryModel savedItem = inventoryRepository.save(newInventoryModel);
        
        // 2. Log it with the actual user
        historyLogRepository.save(new HistoryLog(
            "ITEM_CREATED", 
            "Item initialized with Qty: " + savedItem.getItemQty(), 
            user, // <--- Use variable here
            savedItem.getId()
        ));
        
        return savedItem;
    }

    @PostMapping("/inventory/itemImg")
    public String itemImage (@RequestParam("file") MultipartFile file){
        String folder = "uploads/";
        String itemImage = System.currentTimeMillis() + "_" + file.getOriginalFilename();

        try {
            File uploadDir = new File(folder);
            if(!uploadDir.exists()){
                uploadDir.mkdirs();
            }
            // Save file with unique name to prevent conflicts
            file.transferTo(Paths.get(folder + itemImage));
        } catch (IOException e){
            e.printStackTrace();
            return "Error uploading file: "+ e.getMessage();
        }
        return itemImage;
    }

    @GetMapping("/inventory")
    public List<InventoryModel> getAllItems() {
        try {
            List<InventoryModel> items = inventoryRepository.findAll();
            System.out.println("Retrieved " + items.size() + " items from database");
            return items;
        } catch (Exception e) {
            System.err.println("Error retrieving inventory items: " + e.getMessage());
            e.printStackTrace();
            throw e;
        }
    }

    @GetMapping("/inventory/search")
    public List<InventoryModel> searchItems(@RequestParam String query) {
        try {
            List<InventoryModel> items = inventoryRepository.findByItemNameContainingIgnoreCaseOrItemCategoryContainingIgnoreCase(query, query);
            System.out.println("Search for '" + query + "' returned " + items.size() + " items");
            return items;
        } catch (Exception e) {
            System.err.println("Error searching inventory items: " + e.getMessage());
            e.printStackTrace();
            throw e;
        }
    }

    @GetMapping("/inventory/{id}")
    InventoryModel getItem(@PathVariable Long id){
        return inventoryRepository.findById(id).orElseThrow(() -> new InventoryNotFoundException(id));
    }

    private final String UPLOAD_DIR = "uploads/";

    @GetMapping("/uploads/{filename}")
    public ResponseEntity<FileSystemResource> getImage(@PathVariable String filename){

        // Use Paths.get() to safely combine the directory and filename
        java.nio.file.Path filePath = Paths.get(UPLOAD_DIR, filename);

        File file = filePath.toFile(); // Convert the Path object back to a File object for FileSystemResource

        if (!file.exists()){
            return ResponseEntity.notFound().build();
        }

        // FileSystemResource still accepts a File object
        return ResponseEntity.ok(new FileSystemResource(file));
    }

    @PutMapping("/inventory/{id}")
    @PreAuthorize("hasAuthority('ADMIN')")
    public InventoryModel updateItem(
            @RequestPart(value = "itemDetails") String itemDetails,
            @RequestPart(value = "file", required = false) MultipartFile file,
            @PathVariable Long id
    ) {
        System.out.println("Item Details: " + itemDetails);
        if(file != null){
            System.out.println("no file uploaded");
        } else {
            System.out.println("No file uploaded");
        }
        ObjectMapper mapper = new ObjectMapper();
        InventoryModel newInventory;
        try{
            newInventory = mapper.readValue(itemDetails,InventoryModel.class);
        } catch (Exception e){
            throw new RuntimeException("Error Parsing Item details", e);
        }

        return inventoryRepository.findById(id).map(  existingInventory ->{
            // Logic to detect what changed (optional advanced feature)
            String changeLog = "Details updated.";
            if(existingInventory.getItemQty() != newInventory.getItemQty()){
                changeLog = "Stock adjusted: " + existingInventory.getItemQty() + " → " + newInventory.getItemQty();
            }

            existingInventory.setItemId(newInventory.getItemId());
            existingInventory.setItemName(newInventory.getItemName());
            existingInventory.setItemCategory(newInventory.getItemCategory());
            existingInventory.setItemQty(newInventory.getItemQty());
            existingInventory.setItemDetails(newInventory.getItemDetails());

            if(file != null && !file.isEmpty()){
                String folder = "uploads/";
                String itemImage = System.currentTimeMillis() + "_" + file.getOriginalFilename();
                try{
                    file.transferTo(Paths.get(folder + itemImage));
                    existingInventory.setItemImage(itemImage);
                    changeLog += " Image updated.";
                } catch (IOException e){
                    throw new RuntimeException("Error saving uploaded file", e);
                }
            }
            
            InventoryModel updated = inventoryRepository.save(existingInventory);

            // 1. Extract user from the newInventory object (parsed from JSON)
            String user = newInventory.getPerformedBy();
            if (user == null || user.isEmpty()) user = "System Admin";

            // 2. Log it with the actual user
            historyLogRepository.save(new HistoryLog(
                "ITEM_UPDATED", 
                changeLog, 
                user, // <--- Use variable here
                updated.getId()
            ));

            // --- 🔔 NEW: CHECK FOR LOW STOCK ALERT ---
            // 1. Convert the String quantity to an Integer
            int currentQty = 0;
            try {
                currentQty = Integer.parseInt(updated.getItemQty());
            } catch (NumberFormatException e) {
                currentQty = 0; // Default if data is garbage
            }

            // 2. Compare the number
            if (currentQty < 10) {
                emailService.sendLowStockAlert(updated.getItemName(), currentQty);
            }
            // ----------------------------------------

            return updated;
        }).orElseThrow(() -> new InventoryNotFoundException(id));
    }

    // NEW ENDPOINT: Get History for an Item
    @GetMapping("/history/{itemId}")
    public List<HistoryLog> getItemHistory(@PathVariable Long itemId) {
        return historyLogRepository.findByInventoryIdOrderByTimestampDesc(itemId);
    }

    // Delete
    @DeleteMapping("/inventory/{id}")
    @PreAuthorize("hasAuthority('ADMIN')")
    String deleteItem(@PathVariable Long id){
        if(!inventoryRepository.existsById(id)){
            throw new InventoryNotFoundException(id);
        }
        
        // LOG IT (Before deletion, we log it. Note: If you delete the item, make sure HistoryLog doesn't crash. 
        // Ideally, in a real system, you 'soft delete' items. For now, we will save the log but it points to a deleted ID.)
        // For delete operations, we don't have user info from frontend, so default to System Admin
        historyLogRepository.save(new HistoryLog(
            "ITEM_DELETED", 
            "Permanent deletion of record.", 
            "System Admin", 
            id
        ));

        InventoryModel inventoryItem = inventoryRepository.findById(id)
                .orElseThrow(() -> new InventoryNotFoundException(id));

        String itemImage = inventoryItem.getItemImage();
        if(itemImage != null && !itemImage.isEmpty()){
            File imageFile = new File("uploads/" + itemImage);
            if(imageFile.exists()){
               if(imageFile.delete()){
                   System.out.println("Image Deleted ..");
               } else {
                   System.out.println("Failed to Delete Image ..");
               }
            }
        }
        inventoryRepository.deleteById(id);
        return "data with id " + id + "and image deleted";
    }
}