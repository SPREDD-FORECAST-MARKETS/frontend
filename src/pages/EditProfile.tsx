import { useState, useEffect } from 'react';
import { X, Upload, User, Info } from 'lucide-react';
import { useToast } from '../hooks/useToast';
import type { UpdateProfileData } from '../lib/interface';
import { usePrivy } from '@privy-io/react-auth';
import { updateMe } from '../apis/user';
import { uploadFile } from '../apis/files';
import { useAtom } from 'jotai';
import { refreshUserAtom } from '../atoms/user';

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  userData: {
    username?: string;
    profile_pic?: string;
    about?: string;
  };
}

const MAX_IMAGE_SIZE = 1024 * 1024; // 1MB in bytes

const EditProfileModal = ({ isOpen, onClose, userData }: EditProfileModalProps) => {
  const { success, error } = useToast();

  const [formData, setFormData] = useState<UpdateProfileData>({
    username: '',
    about: '',
    keepExistingImage: true
  });

  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [refreshUser, setRefreshUser] = useAtom(refreshUserAtom);


  const { getAccessToken } = usePrivy();

  // Initialize form with user data when modal opens
  useEffect(() => {
    if (isOpen && userData) {
      setFormData({
        username: userData.username || '',
        about: userData.about || '',
        keepExistingImage: true
      });
      setImagePreview(userData.profile_pic || null);
    }
  }, [isOpen, userData]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Check if file size is less than 1MB
      if (file.size > MAX_IMAGE_SIZE) {
        error("Image size must be less than 1MB");
        e.target.value = ''; // Reset the input
        return;
      }

      setFormData(prev => ({
        ...prev,
        profile_pic: file,
        keepExistingImage: false
      }));

      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      success("Image uploaded successfully");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Basic validation
    if (!formData.username.trim()) {
      error("Username is required");
      return;
    }

    setIsSubmitting(true);

    try {
      // onUpdate(formData);

      let imageUrl = userData.profile_pic;

      if (formData.profile_pic !== undefined) {
        const [fileUrl, status] = await uploadFile(formData.profile_pic, "user");

        if (status === -1 || fileUrl === null) {
          error("Failed to upload profile pic!");
          return;
        }

        imageUrl = fileUrl;

      }

      const authToken = await getAccessToken();

      const [, status] = await updateMe(
        formData.username,
        formData.about,
        imageUrl!,
        authToken!
      )

      if (status === -1) {
        error("Failed to update your profile!");
        return;
      }

      setRefreshUser(refreshUser + 1);
      success("Profile updated successfully");
      onClose();
    } catch (err) {
      error("Failed to update profile");
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-70 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative min-h-screen flex items-center justify-center p-4">
        <div
          className="relative w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl overflow-hidden transform transition-all"
          onClick={e => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-5 border-b border-zinc-800 bg-black">
            <h3 className="text-lg font-medium text-white">Edit Profile</h3>
            <button
              onClick={onClose}
              className="p-1 rounded-full hover:bg-zinc-800 transition-colors"
            >
              <X size={20} className="text-gray-400 hover:text-white" />
            </button>
          </div>

          {/* Content */}
          <form onSubmit={handleSubmit} className="p-5 sm:p-6">
            {/* Profile Image */}
            <div className="mb-5">
              <label className="block text-gray-400 font-medium mb-2 text-sm uppercase tracking-wider">
                Profile Image
              </label>

              <div className="flex items-center gap-4">
                <div className="w-20 h-20 rounded-lg overflow-hidden border border-zinc-800 bg-zinc-800/50">
                  {imagePreview ? (
                    <img
                      src={imagePreview}
                      alt="Profile Preview"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <User size={30} className="text-gray-500" />
                    </div>
                  )}
                </div>

                <div className="flex-1">
                  <div
                    className="border-2 border-dashed border-zinc-700 rounded-md p-4 text-center cursor-pointer hover:border-orange-500 transition-colors duration-200"
                    onClick={() => document.getElementById('profile-image-upload')?.click()}
                  >
                    <Upload size={20} className="mx-auto text-gray-400 mb-2" />
                    <p className="text-gray-400 text-sm">
                      Click to upload new image
                    </p>
                    <p className="text-gray-500 text-xs mt-1">
                      Max size: 1MB
                    </p>
                    <input
                      type="file"
                      id="profile-image-upload"
                      accept="image/*"
                      className="hidden"
                      onChange={handleImageUpload}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Username */}
            <div className="mb-5">
              <label htmlFor="username" className="block text-gray-400 font-medium mb-2 text-sm uppercase tracking-wider">
                Username
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
                  @
                </span>
                <input
                  type="text"
                  id="username"
                  name="username"
                  value={formData.username}
                  onChange={handleInputChange}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-md pl-8 pr-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors duration-200"
                  placeholder="username"
                  required
                />
              </div>
            </div>

            {/* Bio */}
            <div className="mb-6">
              <div className="flex items-center">
                <label htmlFor="about" className="block text-gray-400 font-medium mb-2 text-sm uppercase tracking-wider">
                  Bio
                </label>
                <Info size={14} className="ml-2 text-gray-500" />
              </div>
              <textarea
                id="about"
                name="about"
                value={formData.about}
                onChange={handleInputChange}
                rows={3}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-md px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors duration-200"
                placeholder="Tell us about yourself..."
              />
              <p className="mt-1 text-xs text-gray-500">
                This will be displayed on your public profile
              </p>
            </div>

            {/* Buttons */}
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2.5 bg-zinc-800 rounded-lg text-white border border-zinc-700 hover:bg-zinc-700 transition-colors duration-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className={`flex-1 px-4 py-2.5 bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg text-white font-medium hover:from-orange-600 hover:to-orange-700 transition-colors duration-200 ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''}`}
              >
                {isSubmitting ? (
                  <span className="flex items-center justify-center">
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></span>
                    Updating...
                  </span>
                ) : 'Update Profile'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditProfileModal;