"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "@/context/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";

export default function EmployeeAttendance() {
  const { user } = useAuth();
  const [attendance, setAttendance] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [breakActive, setBreakActive] = useState(false);

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;


  // ✅ Fetch today’s attendance
  const fetchAttendance = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/attendance/today`, {
        withCredentials: true,
      });
      setAttendance(res.data.attendance);
    } catch (err: any) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchAttendance();
  }, []);

  // ✅ Check In
  const handleCheckIn = async () => {
    try {
      setLoading(true);
      const res = await axios.post(`${API_BASE_URL}/attendance/checkin`, {}, { withCredentials: true });
      toast.success("Checked in successfully");
      setAttendance(res.data.attendance);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Check-in failed");
    } finally {
      setLoading(false);
    }
  };

  // ✅ Start Break
  const handleStartBreak = async () => {
    try {
      setLoading(true);
      const res = await axios.post(`${API_BASE_URL}/attendance/break/start`, {}, { withCredentials: true });
      toast.success("Break started");
      setAttendance(res.data.attendance);
      setBreakActive(true);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to start break");
    } finally {
      setLoading(false);
    }
  };

  // ✅ End Break
  const handleEndBreak = async () => {
    try {
      setLoading(true);
      const res = await axios.post(`${API_BASE_URL}/attendance/break/end`, {}, { withCredentials: true });
      toast.success("Break ended");
      setAttendance(res.data.attendance);
      setBreakActive(false);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to end break");
    } finally {
      setLoading(false);
    }
  };

  // ✅ Check Out
  const handleCheckOut = async () => {
    try {
      setLoading(true);
      const res = await axios.post(`${API_BASE_URL}/attendance/checkout`, {}, { withCredentials: true });
      toast.success("Checked out successfully");
      setAttendance(res.data.attendance);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Check-out failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <Card className="w-full max-w-3xl mx-auto shadow-md">
        <CardHeader>
          <CardTitle className="text-xl font-semibold">Employee Attendance</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-gray-600">Welcome, {user?.name}</p>

          {/* Buttons Section */}
          <div className="flex flex-wrap gap-3">
            {!attendance?.checkIn && (
              <Button onClick={handleCheckIn} disabled={loading}>
                Check In
              </Button>
            )}

            {attendance?.checkIn && !attendance?.checkOut && (
              <>
                {!breakActive && (
                  <Button onClick={handleStartBreak} variant="outline" disabled={loading}>
                    Start Break
                  </Button>
                )}
                {breakActive && (
                  <Button onClick={handleEndBreak} variant="outline" disabled={loading}>
                    End Break
                  </Button>
                )}
                <Button onClick={handleCheckOut} disabled={loading}>
                  Check Out
                </Button>
              </>
            )}
          </div>

          {/* Attendance Info */}
          {attendance && (
            <div className="mt-4">
              <h2 className="font-medium mb-2">Today’s Record:</h2>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Check-In</TableHead>
                    <TableHead>Check-Out</TableHead>
                    <TableHead>Breaks</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell>{new Date(attendance.date).toLocaleDateString()}</TableCell>
                    <TableCell>
                      {attendance.checkIn ? new Date(attendance.checkIn).toLocaleTimeString() : "-"}
                    </TableCell>
                    <TableCell>
                      {attendance.checkOut ? new Date(attendance.checkOut).toLocaleTimeString() : "-"}
                    </TableCell>
                    <TableCell>
                      {attendance.breaks?.length
                        ? attendance.breaks.map((b: any, i: number) => (
                            <div key={i}>
                              {new Date(b.start).toLocaleTimeString()} -{" "}
                              {b.end ? new Date(b.end).toLocaleTimeString() : "Ongoing"}
                            </div>
                          ))
                        : "-"}
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
