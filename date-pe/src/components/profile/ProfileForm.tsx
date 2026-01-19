
import React, { useState } from "react";
import { Camera, X } from "lucide-react";
import { Card, CardContent } from "../ui/card";

const ProfileForm = () => {
  const [photos, setPhotos] = useState<string[]>([]);
  const [previewPhoto, setPreviewPhoto] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const fileReader = new FileReader();
      fileReader.onload = (event) => {
        if (event.target && event.target.result) {
          const newPhoto = event.target.result.toString();
          setPhotos([...photos, newPhoto]);
        }
      };
      fileReader.readAsDataURL(e.target.files[0]);
    }
  };

  const removePhoto = (index: number) => {
    setPhotos(photos.filter((_, i) => i !== index));
    setPreviewPhoto(null);
  };

  return (
    <div className="max-w-md mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Create Your Profile</h1>
      
      <Card>
        <CardContent>
          <div className="mb-6">
            <label className="block text-sm font-medium mb-2">Profile Photos</label>
            <div className="grid grid-cols-3 gap-2 mb-2">
              {photos.map((photo, index) => (
                <div key={index} className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden">
                  <img
                    src={photo}
                    alt={`User photo ${index + 1}`}
                    className="w-full h-full object-cover"
                    onClick={() => setPreviewPhoto(photo)}
                  />
                  <button
                    type="button"
                    className="absolute top-1 right-1 bg-black/50 rounded-full p-1 text-white"
                    onClick={() => removePhoto(index)}
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
              
              {photos.length < 6 && (
                <label className="flex items-center justify-center bg-gray-100 hover:bg-gray-200 rounded-lg cursor-pointer aspect-square transition-colors">
                  <div className="flex flex-col items-center text-gray-500">
                    <Camera className="w-6 h-6 mb-1" />
                    <span className="text-xs">Add Photo</span>
                  </div>
                  <input type="file" className="hidden" onChange={handleFileChange} accept="image/*" />
                </label>
              )}
            </div>
            <p className="text-xs text-gray-500">Add up to 6 photos to showcase your personality.</p>
          </div>
          
          <div className="mb-6">
            <label htmlFor="name" className="block text-sm font-medium mb-2">
              Full Name
            </label>
            <input
              type="text"
              id="name"
              className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-bloom-blue focus:border-transparent"
              placeholder="Your name"
            />
          </div>
          
          <div className="mb-6">
            <label htmlFor="bio" className="block text-sm font-medium mb-2">
              Bio
            </label>
            <textarea
              id="bio"
              rows={4}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-bloom-blue focus:border-transparent"
              placeholder="Tell us about yourself..."
            ></textarea>
          </div>
          
          <div className="mb-6">
            <label className="block text-sm font-medium mb-2">Interests</label>
            <div className="flex flex-wrap gap-2">
              {['Travel', 'Music', 'Food', 'Sports', 'Reading', 'Movies', 'Art', 'Photography'].map((interest) => (
                <label key={interest} className="inline-flex items-center">
                  <input type="checkbox" className="hidden peer" />
                  <span className="px-3 py-1 rounded-full text-sm bg-gray-100 peer-checked:bg-bloom-blue peer-checked:text-white cursor-pointer transition-colors">
                    {interest}
                  </span>
                </label>
              ))}
            </div>
          </div>
          
          <div className="mb-6">
            <label className="block text-sm font-medium mb-2">I am a</label>
            <div className="flex gap-4">
              <label className="flex-1 flex items-center p-3 rounded-lg border border-gray-300 cursor-pointer hover:bg-gray-50">
                <input type="radio" name="role" value="inviter" className="mr-3" />
                <div>
                  <h3 className="font-medium">Inviter</h3>
                  <p className="text-xs text-gray-500">Invite others and earn rewards</p>
                </div>
              </label>
              <label className="flex-1 flex items-center p-3 rounded-lg border border-gray-300 cursor-pointer hover:bg-gray-50">
                <input type="radio" name="role" value="datee" className="mr-3" />
                <div>
                  <h3 className="font-medium">Datee</h3>
                  <p className="text-xs text-gray-500">Find connections and dates</p>
                </div>
              </label>
            </div>
          </div>
          
          <button
            type="button"
            className="w-full py-3 rounded-full bg-bloom-blue text-white font-medium shadow-lg shadow-bloom-blue/20 transition-transform hover:translate-y-[-2px]"
          >
            Create Profile
          </button>
        </CardContent>
      </Card>
      
      {previewPhoto && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4" onClick={() => setPreviewPhoto(null)}>
          <div className="max-w-lg max-h-[80vh] relative">
            <img src={previewPhoto} alt="Preview" className="max-w-full max-h-full object-contain rounded-lg" />
            <button
              type="button"
              className="absolute top-4 right-4 bg-black/50 rounded-full p-2 text-white"
              onClick={() => setPreviewPhoto(null)}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileForm;
