import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react-native";
import { Image } from "expo-image";
import { Button, View, XStack, YStack, AlertDialog, useTheme } from "tamagui";
import { MaterialIcons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import MediaUpload, {
  uploadImage,
  deleteImage,
  ImageObject,
} from "@/components/MediaUpload";
import supabase from "@/lib/supabase";
import { useProfile } from "@/providers/ProfileProvider";

// Mock modules that require native functionality
jest.mock("expo-image-picker");
jest.mock("@/lib/supabase");
jest.mock("@/providers/ProfileProvider");

// Use actual Tamagui UI components but mock any platform-specific functionality
jest.mock("tamagui", () => {
  const actualModule = jest.requireActual("tamagui");

  return {
    ...actualModule,
    // Mock theme to avoid issues with tamagui's server/client contexts
    useTheme: jest.fn(() => ({
      background: "#ffffff",
      color: "#000000",
      backgroundHover: "#f0f0f0",
      color02: "#cccccc",
    })),
  };
});

// Mock sample data
const mockImages = [
  { uri: "file://sample/path1.jpg", order: 0 },
  { uri: "file://sample/path2.jpg", order: 1 },
];

const mockActiveProfileId = "user-123";

describe("MediaUpload Component", () => {
  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks();

    // Mock useProfile hook
    (useProfile as jest.Mock).mockReturnValue({
      activeProfileId: mockActiveProfileId,
    });

    // Mock supabase storage methods
    (supabase.storage.from as jest.Mock).mockReturnValue({
      update: jest.fn().mockResolvedValue({ error: null }),
      remove: jest.fn().mockResolvedValue({ error: null }),
    });

    // Mock fetch for uploadImage
    global.fetch = jest.fn().mockResolvedValue({
      arrayBuffer: jest.fn().mockResolvedValue(new ArrayBuffer(8)),
    });
  });

  test("renders with the correct number of image slots", () => {
    const { getAllByTestId } = render(
      <MediaUpload
        images={mockImages}
        onUpload={jest.fn()}
        onDelete={jest.fn()}
        onLoad={jest.fn()}
        testID="media-upload"
      />
    );

    // There should be 9 image slots (Views with testID="image-slot-X")
    // Add testIDs to your component for better testing
    const imageSlots = getAllByTestId(/^image-slot-/);
    expect(imageSlots.length).toBe(9);
  });

  test("calls onLoad when component mounts", () => {
    const onLoadMock = jest.fn();
    render(<MediaUpload images={mockImages} onLoad={onLoadMock} />);

    expect(onLoadMock).toHaveBeenCalledTimes(1);
  });

  test("shows existing images correctly", () => {
    const { getByTestId } = render(
      <MediaUpload images={mockImages} testID="media-upload" />
    );

    // Check that the first two slots have images
    const firstSlot = getByTestId("image-slot-0");
    const secondSlot = getByTestId("image-slot-1");

    // Verify Image component is rendered for these slots
    expect(firstSlot).toContainElement(getByTestId("image-0"));
    expect(secondSlot).toContainElement(getByTestId("image-1"));
  });

  test("opens delete modal when delete button is clicked", async () => {
    const { getByTestId } = render(
      <MediaUpload images={mockImages} testID="media-upload" />
    );

    const deleteButton = getByTestId("delete-button-0");
    fireEvent.press(deleteButton);

    await waitFor(() => {
      expect(getByTestId("delete-modal")).toBeTruthy();
    });
  });

  test("calls onDelete and removes image when delete is confirmed", async () => {
    const onDeleteMock = jest.fn();
    const { getByTestId } = render(
      <MediaUpload
        images={mockImages}
        onDelete={onDeleteMock}
        testID="media-upload"
      />
    );

    const deleteButton = getByTestId("delete-button-0");
    fireEvent.press(deleteButton);

    await waitFor(() => {
      const confirmButton = getByTestId("confirm-delete-button");
      fireEvent.press(confirmButton);
    });

    expect(onDeleteMock).toHaveBeenCalledWith(mockImages[0]);
    expect(deleteImage).toHaveBeenCalledWith(
      mockActiveProfileId,
      mockImages[0]
    );
  });

  test("opens replace modal when clicking on a slot with an existing image", async () => {
    const { getByTestId } = render(
      <MediaUpload images={mockImages} testID="media-upload" />
    );

    // Find the first image slot (which has an image) and click it
    const imageSlot = getByTestId("image-slot-0");
    fireEvent.press(imageSlot);

    await waitFor(() => {
      expect(getByTestId("replace-modal")).toBeTruthy();
    });
  });

  test("launches image picker when clicking on an empty slot", async () => {
    // Mock ImagePicker.launchImageLibraryAsync
    (ImagePicker.launchImageLibraryAsync as jest.Mock).mockResolvedValue({
      canceled: false,
      assets: [{ uri: "file://new/image.jpg" }],
    });

    const onUploadMock = jest.fn();
    const { getByTestId } = render(
      <MediaUpload
        images={mockImages}
        onUpload={onUploadMock}
        testID="media-upload"
      />
    );

    // Find an empty slot (order 2) and click it
    const emptySlot = getByTestId("image-slot-2");
    fireEvent.press(emptySlot);

    await waitFor(() => {
      expect(ImagePicker.launchImageLibraryAsync).toHaveBeenCalled();
      expect(onUploadMock).toHaveBeenCalledWith({
        uri: "file://new/image.jpg",
        order: 2,
      });
      expect(uploadImage).toHaveBeenCalledWith(mockActiveProfileId, {
        uri: "file://new/image.jpg",
        order: 2,
      });
    });
  });

  test("launches image picker when replace is confirmed", async () => {
    // Mock ImagePicker.launchImageLibraryAsync
    (ImagePicker.launchImageLibraryAsync as jest.Mock).mockResolvedValue({
      canceled: false,
      assets: [{ uri: "file://new/replacement.jpg" }],
    });

    const onUploadMock = jest.fn();
    const { getByTestId } = render(
      <MediaUpload
        images={mockImages}
        onUpload={onUploadMock}
        testID="media-upload"
      />
    );

    // Find the first image slot (which has an image) and click it
    const imageSlot = getByTestId("image-slot-0");
    fireEvent.press(imageSlot);

    await waitFor(() => {
      const confirmButton = getByTestId("confirm-replace-button");
      fireEvent.press(confirmButton);
    });

    await waitFor(() => {
      expect(ImagePicker.launchImageLibraryAsync).toHaveBeenCalled();
      expect(onUploadMock).toHaveBeenCalledWith({
        uri: "file://new/replacement.jpg",
        order: 0,
      });
      expect(uploadImage).toHaveBeenCalledWith(mockActiveProfileId, {
        uri: "file://new/replacement.jpg",
        order: 0,
      });
    });
  });

  test("cancel buttons in modals close the dialogs", async () => {
    const { getByTestId, queryByTestId } = render(
      <MediaUpload images={mockImages} testID="media-upload" />
    );

    // Test delete modal cancel
    const deleteButton = getByTestId("delete-button-0");
    fireEvent.press(deleteButton);

    await waitFor(() => {
      const cancelButton = getByTestId("cancel-delete-button");
      fireEvent.press(cancelButton);
    });

    // Delete modal should be closed
    expect(queryByTestId("delete-modal")).toBeNull();

    // Test replace modal cancel
    const imageSlot = getByTestId("image-slot-0");
    fireEvent.press(imageSlot);

    await waitFor(() => {
      const cancelButton = getByTestId("cancel-replace-button");
      fireEvent.press(cancelButton);
    });

    // Replace modal should be closed
    expect(queryByTestId("replace-modal")).toBeNull();
  });

  test("handles image picker cancellation", async () => {
    // Mock ImagePicker.launchImageLibraryAsync with canceled result
    (ImagePicker.launchImageLibraryAsync as jest.Mock).mockResolvedValue({
      canceled: true,
      assets: [],
    });

    const onUploadMock = jest.fn();
    const { getByTestId } = render(
      <MediaUpload
        images={mockImages}
        onUpload={onUploadMock}
        testID="media-upload"
      />
    );

    // Find an empty slot and click it
    const emptySlot = getByTestId("image-slot-2");
    fireEvent.press(emptySlot);

    await waitFor(() => {
      expect(ImagePicker.launchImageLibraryAsync).toHaveBeenCalled();
      expect(onUploadMock).not.toHaveBeenCalled(); // Upload should not be called
      expect(uploadImage).not.toHaveBeenCalled(); // Upload should not be called
    });
  });
});

// Test the helper functions
describe("Helper Functions", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // Mock supabase storage methods
    (supabase.storage.from as jest.Mock).mockReturnValue({
      update: jest.fn().mockResolvedValue({ error: null }),
      remove: jest.fn().mockResolvedValue({ error: null }),
    });

    // Mock fetch for uploadImage
    global.fetch = jest.fn().mockResolvedValue({
      arrayBuffer: jest.fn().mockResolvedValue(new ArrayBuffer(8)),
    });
  });

  test("uploadImage calls supabase correctly", async () => {
    const profileId = "test-profile-123";
    const imageObject = { uri: "file://test/image.jpg", order: 0 };

    await uploadImage(profileId, imageObject);

    expect(supabase.storage.from).toHaveBeenCalledWith("profile-images");
    expect(supabase.storage.from("profile-images").update).toHaveBeenCalledWith(
      "test-profile-123/0.jpg",
      expect.any(ArrayBuffer),
      { contentType: "image/jpeg" }
    );
  });

  test("deleteImage calls supabase correctly", async () => {
    const profileId = "test-profile-123";
    const imageObject = { uri: "file://test/image.jpg", order: 0 };

    await deleteImage(profileId, imageObject);

    expect(supabase.storage.from).toHaveBeenCalledWith("profile-images");
    expect(supabase.storage.from("profile-images").remove).toHaveBeenCalledWith(
      ["test-profile-123/0.jpg"]
    );
  });

  test("deleteImage handles empty image object", async () => {
    const profileId = "test-profile-123";
    await deleteImage(profileId, null as unknown as ImageObject);

    expect(supabase.storage.from).not.toHaveBeenCalled();
  });

  test("uploadImage and deleteImage handle errors correctly", async () => {
    // Mock console.error to verify error handling
    jest.spyOn(console, "error").mockImplementation(() => {});

    // Mock supabase to throw errors
    (supabase.storage.from as jest.Mock).mockReturnValue({
      update: jest
        .fn()
        .mockResolvedValue({ error: new Error("Upload failed") }),
      remove: jest
        .fn()
        .mockResolvedValue({ error: new Error("Delete failed") }),
    });

    const profileId = "test-profile-123";
    const imageObject = { uri: "file://test/image.jpg", order: 0 };

    // Test upload error handling
    await uploadImage(profileId, imageObject);
    expect(console.error).toHaveBeenCalledWith(
      "Upload error:",
      expect.any(Error)
    );

    // Reset mock
    (console.error as jest.Mock).mockClear();

    // Test delete error handling
    await deleteImage(profileId, imageObject);
    expect(console.error).toHaveBeenCalledWith(
      "Delete error:",
      expect.any(Error)
    );
  });
});
