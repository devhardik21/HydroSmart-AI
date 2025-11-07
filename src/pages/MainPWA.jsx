import React, { useState, useEffect } from 'react';
import { Camera, MapPin, Send, CheckCircle, AlertCircle, Loader } from 'lucide-react';
const API_URL_DEP =`https://powerguard-backend.onrender.com` ;
const API_URL_LOC =`http://localhost:8000` ;
export default function HydroSmartApp() {
    const [image, setImage] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [description, setDescription] = useState('');
    const [location, setLocation] = useState(null);
    const [loading, setLoading] = useState(false);
    const [locationLoading, setLocationLoading] = useState(false);
    const [status, setStatus] = useState({ type: '', message: '' });

    // Auto-fetch location on component mount
    useEffect(() => {
        fetchLocation();
    }, []);

    const fetchLocation = () => {
        setLocationLoading(true);
        if ('geolocation' in navigator) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setLocation({
                        latitude: position.coords.latitude,
                        longitude: position.coords.longitude
                    });
                    setLocationLoading(false);
                    setStatus({ type: 'success', message: 'Location captured successfully' });
                    setTimeout(() => setStatus({ type: '', message: '' }), 3000);
                },
                (error) => {
                    setLocationLoading(false);
                    setStatus({ type: 'error', message: 'Unable to fetch location. Please enable GPS.' });
                }
            );
        } else {
            setLocationLoading(false);
            setStatus({ type: 'error', message: 'Geolocation not supported by your browser' });
        }
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImage(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!image) {
            setStatus({ type: 'error', message: 'Please upload an image' });
            return;
        }

        if (!description.trim()) {
            setStatus({ type: 'error', message: 'Please add a description' });
            return;
        }

        if (!location) {
            setStatus({ type: 'error', message: 'Location not available. Please try again.' });
            return;
        }

        setLoading(true);
        setStatus({ type: '', message: '' });

        try {
            const formData = new FormData();
            formData.append('myimg', image);
            formData.append('description', description);
            formData.append('latitude', location.latitude);
            formData.append('longitude', location.longitude);

            const response = await fetch(`${API_URL_DEP}/api/query`, {
                method: 'POST',
                body: formData
            });

            const data = await response.json();

            if (response.ok) {
                setStatus({ type: 'success', message: 'Query submitted successfully!' });
                // Reset form
                setImage(null);
                setImagePreview(null);
                setDescription('');
                fetchLocation(); // Refresh location for next submission
            } else {
                setStatus({ type: 'error', message: data.message || 'Failed to submit query' });
            }
        } catch (error) {
            setStatus({ type: 'error', message: 'Network error. Please try again.' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white p-6 shadow-lg">
                <h1 className="text-3xl font-bold flex items-center gap-2">
                    💧 HydroSmart
                </h1>
                <p className="text-blue-100 text-sm mt-1">Water Quality Monitoring</p>
            </div>

            {/* Main Content */}
            <div className="p-4 max-w-lg mx-auto">
                {/* Status Messages */}
                {status.message && (
                    <div className={`mb-4 p-4 rounded-lg flex items-center gap-2 ${status.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
                        }`}>
                        {status.type === 'success' ? (
                            <CheckCircle className="w-5 h-5 flex-shrink-0" />
                        ) : (
                            <AlertCircle className="w-5 h-5 flex-shrink-0" />
                        )}
                        <span className="text-sm">{status.message}</span>
                    </div>
                )}

                {/* Location Status */}
                <div className="bg-white rounded-xl shadow-md p-4 mb-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <MapPin className="w-5 h-5 text-blue-600" />
                            <span className="font-medium text-gray-700">Location</span>
                        </div>
                        {locationLoading ? (
                            <Loader className="w-5 h-5 text-blue-600 animate-spin" />
                        ) : location ? (
                            <CheckCircle className="w-5 h-5 text-green-600" />
                        ) : (
                            <button
                                onClick={fetchLocation}
                                className="text-blue-600 text-sm font-medium"
                            >
                                Enable
                            </button>
                        )}
                    </div>
                    {location && (
                        <div className="mt-2 text-xs text-gray-500">
                            <p>Lat: {location.latitude.toFixed(6)}</p>
                            <p>Lng: {location.longitude.toFixed(6)}</p>
                        </div>
                    )}
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Image Upload */}
                    <div className="bg-white rounded-xl shadow-md p-4">
                        <label className="block text-sm font-medium text-gray-700 mb-3">
                            Upload Photo
                        </label>

                        <input
                            type="file"
                            accept="image/*"
                            capture="environment"
                            onChange={handleImageChange}
                            className="hidden"
                            id="image-upload"
                        />

                        <label
                            htmlFor="image-upload"
                            className="block cursor-pointer"
                        >
                            {imagePreview ? (
                                <div className="relative">
                                    <img
                                        src={imagePreview}
                                        alt="Preview"
                                        className="w-full h-48 object-cover rounded-lg"
                                    />
                                    <div className="absolute inset-0 bg-black bg-opacity-30 rounded-lg flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                                        <Camera className="w-8 h-8 text-white" />
                                    </div>
                                </div>
                            ) : (
                                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-500 transition-colors">
                                    <Camera className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                                    <p className="text-gray-600 text-sm">Tap to capture or upload</p>
                                </div>
                            )}
                        </label>
                    </div>

                    {/* Description */}
                    <div className="bg-white rounded-xl shadow-md p-4">
                        <label className="block text-sm font-medium text-gray-700 mb-3">
                            Description
                        </label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Describe the water quality issue..."
                            rows="4"
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none"
                        />
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={loading || !location}
                        className={`w-full py-4 rounded-xl font-semibold text-white flex items-center justify-center gap-2 shadow-lg transition-all ${loading || !location
                                ? 'bg-gray-400 cursor-not-allowed'
                                : 'bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 active:scale-95'
                            }`}
                    >
                        {loading ? (
                            <>
                                <Loader className="w-5 h-5 animate-spin" />
                                Submitting...
                            </>
                        ) : (
                            <>
                                <Send className="w-5 h-5" />
                                Submit Query
                            </>
                        )}
                    </button>
                </form>

                {/* Footer Info */}
                <div className="mt-6 text-center text-xs text-gray-500">
                    <p>Your location will be automatically captured</p>
                    <p className="mt-1">Help us monitor water quality in your area</p>
                </div>
            </div>
        </div>
    );
}