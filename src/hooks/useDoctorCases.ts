
import { useEffect, useState } from "react";
import supabase from "@/lib/supabaseClient";
import { TimeFrame } from "@/components/ui/TimeFilter";

export interface DoctorCasePatient {
  case_id: string;
  created_at: string;
  updated_at: string;
  case_status: string;
  priority_rank: number;
  notes: string | null;
  initial_diagnosis: string | null;
  final_diagnosis: string | null;
  diagnosis_confirmed_by: string | null;
  patient_id: string;
  patient_name: string;
  date_of_birth: string;
  medical_history: string | null;
  gender: string | null;
  patient_phone_number: string;
  national_id: string;
  scan_id: string | null;
  ai_diagnosis_id: string | null;
  ai_diagnosis: string | null;
  ai_confidence_score: number | null;
  ai_priority_rank: number | null;
  llm_generated_patient_history: string | null;
}

export type SortType = "newest" | "oldest" | "status" | "priority";

export function useDoctorCases(timeframe: TimeFrame = "week") {
  const [data, setData] = useState<DoctorCasePatient[]>([]);
  const [filteredData, setFilteredData] = useState<DoctorCasePatient[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [previousTimeframe, setPreviousTimeframe] = useState<TimeFrame | null>(null);
  const [previousSortBy, setPreviousSortBy] = useState<SortType | null>(null);

  // Function to filter data based on timeframe
  const filterDataByTimeframe = (data: DoctorCasePatient[], timeframe: TimeFrame) => {
    const now = new Date();
    let earliestDate = new Date();
    
    // Determine the earliest date based on timeframe
    switch (timeframe) {
      case "hour":
        earliestDate.setHours(now.getHours() - 1);
        break;
      case "day":
        earliestDate.setDate(now.getDate() - 1);
        break;
      case "week":
        earliestDate.setDate(now.getDate() - 7);
        break;
      case "month":
        earliestDate.setMonth(now.getMonth() - 1);
        break;
      case "year":
        earliestDate.setFullYear(now.getFullYear() - 1);
        break;
      default:
        earliestDate.setDate(now.getDate() - 7); // Default to 1 week
    }

    return data.filter(item => {
      const itemDate = new Date(item.created_at);
      return itemDate >= earliestDate;
    });
  };

  // Store previous state before changing timeframe
  const savePreviousTimeframe = () => {
    setPreviousTimeframe(timeframe);
  };

  // Store previous sort type
  const savePreviousSortType = (currentSortBy: SortType) => {
    setPreviousSortBy(currentSortBy);
    return currentSortBy;
  };

  // Restore previous timeframe
  const restorePreviousTimeframe = () => {
    if (previousTimeframe) {
      const restored = previousTimeframe;
      setPreviousTimeframe(null);
      return restored;
    }
    return timeframe;
  };

  // Restore previous sort type
  const restorePreviousSortType = () => {
    if (previousSortBy) {
      const restored = previousSortBy;
      setPreviousSortBy(null);
      return restored;
    }
    return null;
  };

  // Fetch data effect
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Get user session
        const { data: { session } } = await supabase.auth.getSession();

        if (!session?.user?.email) {
          setError("No user email found. Please sign in.");
          setLoading(false);
          return;
        }

        // Call the RPC function with 'email' parameter
        const { data: rpcData, error: rpcError } = await supabase.rpc(
          "get_doctor_cases_and_patients",
          {
            email: session.user.email,
          }
        );

        if (rpcError) {
          console.error("RPC Error:", rpcError);
          setError(rpcError.message);
        } else {
          setData(rpcData || []);
          setFilteredData(filterDataByTimeframe(rpcData || [], timeframe));
        }
      } catch (err: any) {
        console.error("Error fetching data:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Update filtered data when timeframe changes
  useEffect(() => {
    setFilteredData(filterDataByTimeframe(data, timeframe));
  }, [data, timeframe]);

  return { 
    data: filteredData, 
    allData: data, 
    loading, 
    error, 
    savePreviousTimeframe, 
    restorePreviousTimeframe, 
    savePreviousSortType,
    restorePreviousSortType
  };
}
