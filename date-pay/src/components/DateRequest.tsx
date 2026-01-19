
import React, { useState } from 'react';
import { Calendar, Clock, DollarSign, MapPin, Check, X } from 'lucide-react';
import { Button } from "@/components/ui/button";

interface DateRequestProps {
  profileName: string;
  profileImage: string;
  dateTime: string;
  location: string;
  depositAmount: number;
  onAccept?: () => void;
  onDecline?: () => void;
}

const DateRequest: React.FC<DateRequestProps> = ({
  profileName,
  profileImage,
  dateTime,
  location,
  depositAmount,
  onAccept,
  onDecline
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100 hover-scale animate-slide-up">
      <div className="p-6">
        <div className="flex items-center space-x-4">
          <div className="h-12 w-12 rounded-full overflow-hidden">
            <img src={profileImage} alt={profileName} className="h-full w-full object-cover" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{profileName}</h3>
            <p className="text-sm text-gray-500">Date Request</p>
          </div>
        </div>
        
        <div className="mt-6 space-y-4">
          <div className="flex items-center space-x-3">
            <div className="h-8 w-8 rounded-full bg-coral-100 flex items-center justify-center">
              <Calendar className="h-4 w-4 text-coral-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">{dateTime}</p>
              <p className="text-xs text-gray-500">Date & Time</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <div className="h-8 w-8 rounded-full bg-coral-100 flex items-center justify-center">
              <MapPin className="h-4 w-4 text-coral-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">{location}</p>
              <p className="text-xs text-gray-500">Location</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <div className="h-8 w-8 rounded-full bg-coral-100 flex items-center justify-center">
              <DollarSign className="h-4 w-4 text-coral-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">${depositAmount.toFixed(2)}</p>
              <p className="text-xs text-gray-500">Security Deposit</p>
            </div>
          </div>
        </div>
        
        {isExpanded && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <h4 className="text-sm font-medium text-gray-900 mb-2">Security Deposit Details</h4>
            <p className="text-xs text-gray-600 mb-4">
              This security deposit serves as a commitment to the date. The full amount will be returned at the end of the date.
              If either party doesn't show up, the deposit is forfeit.
            </p>
            <div className="text-xs text-gray-600">
              <p>• Deposit held in secure escrow</p>
              <p>• Released immediately after date confirmation</p>
              <p>• No hidden fees or charges</p>
            </div>
          </div>
        )}
        
        <div className="mt-4">
          <button 
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-sm text-coral-600 hover:text-coral-700 font-medium"
          >
            {isExpanded ? "Hide details" : "View deposit details"}
          </button>
        </div>
        
        <div className="mt-6 flex space-x-3">
          <Button 
            variant="outline" 
            onClick={onDecline}
            className="flex-1 border-gray-200 text-gray-700 hover:bg-gray-100"
          >
            <X className="h-4 w-4 mr-2" />
            Decline
          </Button>
          <Button 
            onClick={onAccept}
            className="flex-1 bg-coral-500 hover:bg-coral-600 text-white"
          >
            <Check className="h-4 w-4 mr-2" />
            Accept
          </Button>
        </div>
      </div>
    </div>
  );
};

export default DateRequest;
