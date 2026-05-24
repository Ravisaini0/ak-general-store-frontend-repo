import Footer from "../../components/common/Footer";
import BackButton from "../../components/common/BackButton";
import Header from "../../components/common/Header";
import TopBar from "../../components/common/TopBar";
import Button from "../../components/common/Button";
import Modal from "../../components/common/Modal";
import { useAuth } from "../../context/AuthContext";
import { removeProfileAvatar, uploadProfileAvatar } from "../../services/authService";
import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import {
  getImageUploadSupportText,
  validateImageUploadFile,
} from "../../utils/imageUploadRules";

function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onerror = () => reject(new Error("Unable to read image."));
    reader.onload = () => resolve(typeof reader.result === "string" ? reader.result : "");
    reader.readAsDataURL(file);
  });
}

function createCroppedAvatarFile(dataUrl, zoom = 1, outputSize = 512, quality = 0.88) {
  return new Promise((resolve, reject) => {
    const image = new Image();

    image.onerror = () => reject(new Error("Unable to process image."));
    image.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = outputSize;
      canvas.height = outputSize;

      const context = canvas.getContext("2d");
      if (!context) {
        reject(new Error("Image canvas is not available."));
        return;
      }

      const baseScale = Math.max(outputSize / image.width, outputSize / image.height);
      const finalScale = baseScale * zoom;
      const drawWidth = image.width * finalScale;
      const drawHeight = image.height * finalScale;
      const offsetX = (outputSize - drawWidth) / 2;
      const offsetY = (outputSize - drawHeight) / 2;

      context.clearRect(0, 0, outputSize, outputSize);
      context.drawImage(image, offsetX, offsetY, drawWidth, drawHeight);

      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error("Image compression failed."));
            return;
          }

          resolve(
            new File([blob], "profile-image.jpg", {
              type: "image/jpeg",
            })
          );
        },
        "image/jpeg",
        quality
      );
    };

    image.src = dataUrl;
  });
}

export default function Profile() {
  const { session, logout, updateProfile } = useAuth();
  const navigate = useNavigate();
  const [avatarMessage, setAvatarMessage] = useState("");
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [isRemovingAvatar, setIsRemovingAvatar] = useState(false);
  const [avatarSource, setAvatarSource] = useState("");
  const [avatarZoom, setAvatarZoom] = useState(1);
  const [avatarModalOpen, setAvatarModalOpen] = useState(false);
  const [avatarLoadFailed, setAvatarLoadFailed] = useState(false);
  const imageUploadSupportText = getImageUploadSupportText();

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  const userInitial = (session?.name || "A").charAt(0).toUpperCase();

  useEffect(() => {
    setAvatarLoadFailed(false);
  }, [session?.avatar]);

  const handleProfileImageChange = async (event) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    const invalidMessage = validateImageUploadFile(file);
    if (invalidMessage) {
      setAvatarMessage(invalidMessage);
      event.target.value = "";
      return;
    }

    try {
      const source = await readFileAsDataUrl(file);
      setAvatarSource(source);
      setAvatarZoom(1);
      setAvatarMessage("");
      setAvatarModalOpen(true);
    } catch {
      setAvatarMessage("Selected image could not be opened. Please try another JPG, PNG, or WEBP file.");
    } finally {
      event.target.value = "";
    }
  };

  const handleConfirmAvatarUpload = async () => {
    if (!avatarSource) {
      return;
    }

    setAvatarMessage("");
    setIsUploadingAvatar(true);

    try {
      const optimizedFile = await createCroppedAvatarFile(avatarSource, avatarZoom);
      const avatarUrl = await uploadProfileAvatar(optimizedFile);
      updateProfile({
        avatar: avatarUrl,
      });
      setAvatarModalOpen(false);
      setAvatarSource("");
      setAvatarZoom(1);
      setAvatarMessage("Profile image updated successfully.");
    } catch (error) {
      setAvatarMessage(
        error?.message ||
          "Profile image could not be uploaded. Please try a smaller JPG, PNG, or WEBP image."
      );
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const handleRemoveAvatar = async () => {
    setAvatarMessage("");
    setIsRemovingAvatar(true);

    try {
      await removeProfileAvatar();
      updateProfile({
        avatar: null,
      });
      setAvatarMessage("Profile image removed successfully.");
    } catch {
      setAvatarMessage("Profile image could not be removed. Please try again.");
    } finally {
      setIsRemovingAvatar(false);
    }
  };

  const handleCloseAvatarModal = () => {
    if (isUploadingAvatar) {
      return;
    }

    setAvatarModalOpen(false);
    setAvatarSource("");
    setAvatarZoom(1);
  };

  return (
    <div className="page-shell">
      <TopBar />
      <Header />
      <main className="store-shell py-6">
        <BackButton fallback="/" className="mb-5" />
        <div className="soft-panel max-w-3xl p-6">
          <h1 className="text-4xl font-black text-slate-950">My Profile</h1>
          <div className="mt-6 flex flex-wrap items-center gap-5 rounded-[1.5rem] border border-slate-200 bg-slate-50 p-5">
            {session?.avatar ? (
              !avatarLoadFailed ? (
                <img
                  src={session.avatar}
                  alt="Profile"
                  className="h-24 w-24 rounded-full object-cover"
                  onError={() => setAvatarLoadFailed(true)}
                />
              ) : (
                <div className="flex h-24 w-24 items-center justify-center rounded-full bg-slate-950 text-3xl font-black text-yellow-400">
                  {userInitial}
                </div>
              )
            ) : (
              <div className="flex h-24 w-24 items-center justify-center rounded-full bg-slate-950 text-3xl font-black text-yellow-400">
                {userInitial}
              </div>
            )}
            <div>
              <p className="text-lg font-black text-slate-950">{session?.name || "AK User"}</p>
              <p className="mt-1 text-sm text-slate-500">{session?.email || session?.phone || "Not available"}</p>
              <label
                className={`mt-4 inline-flex cursor-pointer rounded-xl px-4 py-3 text-sm font-black ${
                  isUploadingAvatar ? "bg-slate-200 text-slate-500" : "bg-yellow-400 text-slate-950"
                }`}
              >
                {session?.avatar ? "Change Profile Image" : isUploadingAvatar ? "Uploading..." : "Upload Profile Image"}
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  className="hidden"
                  onChange={handleProfileImageChange}
                />
              </label>
              {session?.avatar ? (
                <button
                  type="button"
                  className={`ml-3 mt-4 inline-flex rounded-xl border border-slate-200 px-4 py-3 text-sm font-bold ${
                    isRemovingAvatar ? "bg-slate-100 text-slate-400" : "bg-white text-slate-700 hover:bg-slate-50"
                  }`}
                  onClick={handleRemoveAvatar}
                  disabled={isRemovingAvatar}
                >
                  {isRemovingAvatar ? "Removing..." : "Remove Avatar"}
                </button>
              ) : null}
              <p className="mt-3 text-sm text-slate-500">{imageUploadSupportText}</p>
              {avatarMessage ? <p className="mt-3 text-sm text-slate-500">{avatarMessage}</p> : null}
            </div>
          </div>
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-sm text-slate-500">Name</p>
              <p className="mt-2 text-xl font-black text-slate-950">{session?.name || "AK User"}</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-sm text-slate-500">Email</p>
              <p className="mt-2 text-xl font-black text-slate-950">{session?.email || "Not available"}</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-sm text-slate-500">Role</p>
              <p className="mt-2 text-xl font-black text-slate-950">{session?.role || "user"}</p>
            </div>
          </div>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link to="/my-orders" className="inline-flex rounded-xl border border-slate-200 px-5 py-3 text-sm font-bold text-slate-800">
              My Orders
            </Link>
            <Link to="/address-book" className="inline-flex rounded-xl border border-slate-200 px-5 py-3 text-sm font-bold text-slate-800">
              Address Book
            </Link>
            <Link to="/aata-chakki-booking" className="inline-flex rounded-xl border border-slate-200 px-5 py-3 text-sm font-bold text-slate-800">
              Aata Chakki Booking
            </Link>
            <Link to="/wishlist" className="inline-flex rounded-xl border border-slate-200 px-5 py-3 text-sm font-bold text-slate-800">
              Wishlist
            </Link>
          </div>
          <Button variant="accent" className="mt-6 px-6 py-3 font-black" onClick={handleLogout}>
            Logout
          </Button>
        </div>
      </main>
      <Footer />
      <Modal open={avatarModalOpen} title="Crop Profile Image" onClose={handleCloseAvatarModal}>
        <div className="space-y-5">
          <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-5">
            <p className="text-sm font-bold text-slate-950">Preview</p>
            <p className="mt-1 text-sm text-slate-500">Adjust the zoom to preview how your circular profile image will look.</p>
            <div className="mt-5 flex justify-center">
              <div className="relative h-52 w-52 overflow-hidden rounded-full border-4 border-white bg-slate-200 shadow-soft">
                {avatarSource ? (
                  <img
                    src={avatarSource}
                    alt="Avatar crop preview"
                    className="h-full w-full object-cover"
                    style={{
                      transform: `scale(${avatarZoom})`,
                      transformOrigin: "center center",
                    }}
                  />
                ) : null}
              </div>
            </div>
            <div className="mt-6">
              <div className="flex items-center justify-between text-sm font-bold text-slate-700">
                <span>Zoom</span>
                <span>{avatarZoom.toFixed(1)}x</span>
              </div>
              <input
                type="range"
                min="1"
                max="2.4"
                step="0.1"
                value={avatarZoom}
                onChange={(event) => setAvatarZoom(Number(event.target.value))}
                className="mt-3 w-full accent-yellow-400"
              />
            </div>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button variant="accent" onClick={handleConfirmAvatarUpload} disabled={isUploadingAvatar} className="px-5 py-3 font-black">
              {isUploadingAvatar ? "Saving..." : "Save Profile Image"}
            </Button>
            <Button variant="ghost" onClick={handleCloseAvatarModal} disabled={isUploadingAvatar} className="px-5 py-3 font-black">
              Cancel
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
