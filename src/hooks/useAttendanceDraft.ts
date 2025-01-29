import { useState, useEffect } from 'react';
import { AttendanceRecord } from '@/types/attendance';

export const useAttendanceDraft = (initialRecords: AttendanceRecord[] = []) => {
  const [draftAttendance, setDraftAttendance] = useState<AttendanceRecord[]>(initialRecords);

  useEffect(() => {
    if (initialRecords.length > 0) {
      setDraftAttendance(initialRecords);
    }
  }, [initialRecords]);

  const updateDraft = (technicianId: string, status: AttendanceRecord["status"]) => {
    setDraftAttendance(prev => {
      const existingIndex = prev.findIndex(record => record.technician_id === technicianId);
      const today = new Date().toISOString().split("T")[0];
      
      if (existingIndex >= 0) {
        const newDraft = [...prev];
        newDraft[existingIndex] = {
          ...newDraft[existingIndex],
          status
        };
        return newDraft;
      }

      return [...prev, {
        id: `draft-${technicianId}`,
        technician_id: technicianId,
        supervisor_id: '',
        date: today,
        status,
        submitted_at: null,
        updated_at: null
      } as AttendanceRecord];
    });
  };

  const clearDraft = () => setDraftAttendance([]);

  return {
    draftAttendance,
    updateDraft,
    clearDraft
  };
};