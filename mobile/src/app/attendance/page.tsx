"use client";

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import MobileLayout from '@/components/layout/MobileLayout';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { 
  Clock, 
  MapPin,
  Calendar,
  BarChart3,
  Camera,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

export default function AttendancePage() {
  const [currentTime, setCurrentTime] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentStatus, setCurrentStatus] = useState<'in' | 'out' | null>(null);
  const [location, setLocation] = useState<string>('');
  const [locationAccuracy, setLocationAccuracy] = useState<number | null>(null);
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);
  const [showCamera, setShowCamera] = useState(false);
  const [permissionsGranted, setPermissionsGranted] = useState({
    camera: false,
    location: false
  });
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    // Update time every second
    const updateTime = () => {
      setCurrentTime(new Date().toLocaleString());
    };
    
    updateTime();
    const timer = setInterval(updateTime, 1000);

    // Get current location with high accuracy
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation(`${position.coords.latitude.toFixed(6)}, ${position.coords.longitude.toFixed(6)}`);
          setLocationAccuracy(position.coords.accuracy);
          setPermissionsGranted(prev => ({ ...prev, location: true }));
        },
        (error) => {
          console.error('Location error:', error);
          setLocation('Location access denied');
          setPermissionsGranted(prev => ({ ...prev, location: false }));
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000
        }
      );
    }

    return () => {
      clearInterval(timer);
      // Cleanup camera stream on component unmount
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }
    };
  }, []);

  const requestCameraPermission = async () => {
    // Check if getUserMedia is supported
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      alert('Camera is not supported on this device or browser.');
      return;
    }

    // First show camera UI to ensure video element is rendered
    setShowCamera(true);
    
    // Wait for next tick to ensure DOM is updated
    await new Promise(resolve => setTimeout(resolve, 100));

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: 'user',
          width: { ideal: 640 },
          height: { ideal: 480 }
        } 
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        setPermissionsGranted(prev => ({ ...prev, camera: true }));
        
        // Wait for video to be ready
        videoRef.current.onloadedmetadata = () => {
          if (videoRef.current) {
            videoRef.current.play();
          }
        };
      } else {
        throw new Error('Video element not available');
      }
    } catch (error) {
      setShowCamera(false); // Hide camera UI on error
      let errorMessage = 'Camera access failed. ';
      if (error instanceof Error) {
        if (error.name === 'NotAllowedError') {
          errorMessage += 'Please allow camera access in your browser settings.';
        } else if (error.name === 'NotFoundError') {
          errorMessage += 'No camera found on this device.';
        } else if (error.name === 'NotSupportedError') {
          errorMessage += 'Camera is not supported.';
        } else {
          errorMessage += error.message;
        }
      }
      
      alert(errorMessage);
      setPermissionsGranted(prev => ({ ...prev, camera: false }));
    }
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const canvas = canvasRef.current;
      const video = videoRef.current;
      const context = canvas.getContext('2d');
      
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      if (context) {
        context.drawImage(video, 0, 0);
        const photoDataUrl = canvas.toDataURL('image/jpeg', 0.8);
        setCapturedPhoto(photoDataUrl);
        setShowCamera(false);
        
        // Stop camera stream
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop());
          streamRef.current = null;
        }
      }
    }
  };

  const retakePhoto = () => {
    setCapturedPhoto(null);
    requestCameraPermission();
  };

  const handleClockAction = async () => {
    // Check permissions first
    if (!permissionsGranted.location) {
      alert('Location access is required for attendance. Please enable location permissions.');
      return;
    }

    // If no photo captured yet, request camera
    if (!capturedPhoto) {
      await requestCameraPermission();
      return;
    }

    setIsLoading(true);
    
    try {
      // Get fresh location data
      await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000
        });
      });

      // Simulate API call with photo and location data
      // In production, you would send this data to your API
      // const attendanceData = {
      //   timestamp: new Date().toISOString(),
      //   latitude: position.coords.latitude,
      //   longitude: position.coords.longitude,
      //   accuracy: position.coords.accuracy,
      //   photo: capturedPhoto,
      //   action: currentStatus === 'in' ? 'out' : 'in'
      // };

      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // In production, you would send attendanceData to your API
      // await fetch('/api/attendance', { method: 'POST', body: JSON.stringify(attendanceData) });
      
      setCurrentStatus(currentStatus === 'in' ? 'out' : 'in');
      setCapturedPhoto(null); // Clear photo for next use
      
      // Show success message
      alert(`Successfully clocked ${currentStatus === 'in' ? 'out' : 'in'}!`);
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      alert(`Failed to record attendance: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  };

  const attendanceHistory = [
    { date: '2025-01-03', clockIn: '08:30', clockOut: '17:15', hours: '8h 45m', status: 'present' },
    { date: '2025-01-02', clockIn: '08:25', clockOut: '17:00', hours: '8h 35m', status: 'present' },
    { date: '2025-01-01', clockIn: '-', clockOut: '-', hours: '-', status: 'holiday' },
    { date: '2024-12-31', clockIn: '08:45', clockOut: '17:30', hours: '8h 45m', status: 'present' },
  ];

  return (
    <MobileLayout>
      <div className="p-4 space-y-6">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">Attendance</h1>
          <p className="text-sm text-gray-600 mt-1">
            Track your work hours
          </p>
        </div>

        {/* Current Time Card */}
        <Card className="text-center bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
          <div className="flex items-center justify-center mb-3">
            <Clock className="h-8 w-8 text-blue-600 mr-2" />
            <h2 className="text-xl font-bold text-blue-900">Current Time</h2>
          </div>
          <p className="text-2xl font-mono font-bold text-blue-800 mb-2">
            {currentTime}
          </p>
          <p className="text-sm text-blue-600">
            Status: <span className="font-medium">
              {currentStatus === 'in' ? 'Clocked In' : 
               currentStatus === 'out' ? 'Clocked Out' : 'Not Clocked In'}
            </span>
          </p>
        </Card>


        {/* Location Card */}
        <Card className="p-3">
          <div className="flex items-center">
            <div className="flex items-center mr-2">
              <MapPin className="h-5 w-5 text-gray-400 mr-1" />
              {permissionsGranted.location ? (
                <CheckCircle className="h-4 w-4 text-green-500" />
              ) : (
                <AlertCircle className="h-4 w-4 text-red-500" />
              )}
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">Current Location</p>
              <p className="text-xs text-gray-500">{location || 'Getting location...'}</p>
              {locationAccuracy && (
                <p className="text-xs text-gray-400">Accuracy: ±{Math.round(locationAccuracy)}m</p>
              )}
            </div>
          </div>
        </Card>

        {/* Camera/Photo Card */}
        {(showCamera || capturedPhoto) && (
          <Card className="p-4">
            <div className="text-center">
              <div className="flex items-center justify-center mb-3">
                <Camera className="h-5 w-5 text-blue-600 mr-2" />
                <h3 className="text-sm font-medium text-gray-900">
                  {showCamera ? 'Take Photo' : 'Photo Captured'}
                </h3>
              </div>
              
              {showCamera && (
                <div className="space-y-3">
                  <div className="relative">
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      muted
                      className="w-full max-w-sm mx-auto rounded-lg bg-black"
                      style={{ aspectRatio: '4/3' }}
                    />
                    {!permissionsGranted.camera && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-lg">
                        <div className="text-white text-center">
                          <Camera className="h-8 w-8 mx-auto mb-2" />
                          <p className="text-sm">Requesting camera access...</p>
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2 justify-center">
                    <Button 
                      onClick={capturePhoto} 
                      variant="primary"
                      disabled={!permissionsGranted.camera}
                    >
                      <Camera className="h-4 w-4 mr-2" />
                      Capture
                    </Button>
                    <Button 
                      onClick={() => {
                        setShowCamera(false);
                        if (streamRef.current) {
                          streamRef.current.getTracks().forEach(track => track.stop());
                          streamRef.current = null;
                        }
                      }} 
                      variant="outline"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              )}
              
              {capturedPhoto && (
                <div className="space-y-3">
                  <Image
                    src={capturedPhoto}
                    alt="Captured photo"
                    width={320}
                    height={240}
                    className="w-full max-w-sm mx-auto rounded-lg"
                  />
                  <div className="flex gap-2 justify-center">
                    <Button onClick={retakePhoto} variant="outline" size="sm">
                      Retake Photo
                    </Button>
                    <div className="flex items-center text-sm text-green-600">
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Photo Ready
                    </div>
                  </div>
                </div>
              )}
            </div>
          </Card>
        )}

        {/* Hidden canvas for photo capture */}
        <canvas ref={canvasRef} style={{ display: 'none' }} />

        {/* Clock In/Out Button */}
        <div className="text-center space-y-3">
          {!capturedPhoto && !showCamera && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-3">
              <div className="flex items-center justify-center text-blue-800">
                <Camera className="h-5 w-5 mr-2" />
                <span className="text-sm font-medium">Photo required for attendance</span>
              </div>
            </div>
          )}
          
          <Button
            fullWidth
            size="lg"
            variant={currentStatus === 'in' ? 'secondary' : 'primary'}
            onClick={handleClockAction}
            loading={isLoading}
            className="py-4 text-lg font-semibold"
            disabled={!permissionsGranted.location}
          >
            {isLoading ? 'Processing...' : 
             !capturedPhoto ? (
               <>
                 <Camera className="h-5 w-5 mr-2" />
                 Take Photo & {currentStatus === 'in' ? 'Clock Out' : 'Clock In'}
               </>
             ) : (
               <>
                 <Clock className="h-5 w-5 mr-2" />
                 {currentStatus === 'in' ? 'Clock Out' : 'Clock In'}
               </>
             )}
          </Button>
          
          {!permissionsGranted.location && (
            <p className="text-sm text-red-600">
              Location permission required for attendance
            </p>
          )}
          
          {currentStatus && (
            <p className="text-sm text-gray-500 mt-2">
              {currentStatus === 'in' ? 
                'You clocked in at 08:30 AM' : 
                'You clocked out at 17:30 PM'}
            </p>
          )}
        </div>

        {/* Today's Summary */}
        <div className="grid grid-cols-3 gap-3">
          <Card className="p-3 text-center">
            <div className="text-lg font-bold text-green-600">8h 45m</div>
            <div className="text-xs text-gray-500">Today</div>
          </Card>
          <Card className="p-3 text-center">
            <div className="text-lg font-bold text-blue-600">42h 15m</div>
            <div className="text-xs text-gray-500">This Week</div>
          </Card>
          <Card className="p-3 text-center">
            <div className="text-lg font-bold text-purple-600">168h</div>
            <div className="text-xs text-gray-500">This Month</div>
          </Card>
        </div>

        {/* Attendance History */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold text-gray-900">Recent History</h2>
            <Button size="sm" variant="ghost">
              View All
            </Button>
          </div>
          
          <Card padding="none">
            <div className="divide-y divide-gray-200">
              {attendanceHistory.map((record, index) => (
                <div key={index} className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {new Date(record.date).toLocaleDateString()}
                        </p>
                        <p className="text-xs text-gray-500">
                          {record.clockIn} - {record.clockOut}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">{record.hours}</p>
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                        record.status === 'present' ? 'bg-green-100 text-green-800' :
                        record.status === 'holiday' ? 'bg-blue-100 text-blue-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {record.status}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-3">
          <Button fullWidth variant="outline">
            <BarChart3 className="h-4 w-4 mr-2" />
            View Report
          </Button>
          <Button fullWidth variant="outline">
            <Calendar className="h-4 w-4 mr-2" />
            Request Leave
          </Button>
        </div>
      </div>
    </MobileLayout>
  );
}