import React, {
  useEffect,
  useState,
  ChangeEvent,
  FormEvent,
  JSX,
  use,
} from "react";
import { X, CheckCircle, AlertCircle } from "lucide-react";
import { useParams } from "react-router-dom";
import axios, { isAxiosError, isCancel } from "axios";
import { Loader2 } from "lucide-react";

interface FormData {
  name: string;
  email: string;
  phone: string;
  address: string;
  state: string;
  country: string;
  zipCode: string;
}

interface FormErrors {
  name?: string;
  email?: string;
  address?: string;
  country?: string;
  zipCode?: string;
}

export default function N8nSubmitForm(): JSX.Element | null {
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [isVisible, setIsVisible] = useState<boolean>(true);
  const [formData, setFormData] = useState<Record<string, string>>({});

  const [apiData, setApiData] = useState<any>(null);
  const { workflow_id, user_id } = useParams();
  useEffect(() => {
    const controller = new AbortController();

    const fetchData = async () => {
      try {
        setIsVisible(false);
        const response = await axios.get(
          `${import.meta.env.VITE_WORKFLOW_URL}/api/workflow/get-on-form/${workflow_id}/${user_id}`,
          { signal: controller.signal },
        );

        setApiData(response.data.data.meta_data);

        setIsVisible(true);
      } catch (error) {
        setIsVisible(true);
        if (axios.isCancel(error) || error.name === "CanceledError") {
          console.log("Request canceled");
        } else {
          console.error("Unexpected error:", error);
        }
      }
    };

    fetchData();

    return () => {
      controller.abort();
    };
  }, [workflow_id, user_id]);

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ): void => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  // @ts-ignore
  const handleSubmit = async (e: FormEvent<HTMLFormElement>): void => {
    e.preventDefault();
    const controller = new AbortController();
    try {
      const responce = await axios.post(
        `${import.meta.env.VITE_WORKFLOW_URL}/api/workflow/form-submission/${workflow_id}/${user_id}`,
        formData,
        { signal: controller.signal },
      );
      setIsSubmitted(responce.data.success);
    } catch (error: any) {
      if (axios.isCancel(error) || error.name === "CanceledError") {
        console.log("Request canceled");
      } else if (isAxiosError(error)) {
        if (
          error.response &&
          error.response.data &&
          error.response.data.errors
        ) {
          const apiErrors = error.response.data.errors;
          const newErrors: FormErrors = {};
          apiErrors.forEach((err: { field: string; message: string }) => {
            newErrors[err.field as keyof FormErrors] = err.message;
          });
          setErrors(newErrors);
        }
      } else {
        console.error("Unexpected error:", error);
      }
    }
  };

  const handleClose = (): void => {
    setIsVisible(false);
  };

  if (!isVisible || apiData === null) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            Loading, please wait...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div
          className="absolute top-20 left-20 w-96 h-96 bg-sky-500/10 rounded-full blur-3xl animate-pulse"
          style={{ animationDuration: "4s" }}
        ></div>
        <div
          className="absolute bottom-20 right-20 w-96 h-96 bg-sky-400/10 rounded-full blur-3xl animate-pulse"
          style={{ animationDuration: "6s", animationDelay: "2s" }}
        ></div>
        <div
          className="absolute top-1/2 left-1/2 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl animate-pulse"
          style={{ animationDuration: "5s", animationDelay: "1s" }}
        ></div>
      </div>

      {/* Form container */}
      <div className="relative w-full max-w-md animate-fade-in">
        <div className="bg-gradient-to-b from-gray-900/95 to-black/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-sky-500/20 overflow-hidden">
          {/* Header */}
          <div className="relative bg-gradient-to-r from-sky-500 to-blue-600 p-6 shadow-lg">
            <div className="absolute inset-0 bg-black/10"></div>
            <div className="relative flex items-center justify-between">
              <h2 className="text-2xl font-bold text-white tracking-tight">
                N8N Form
              </h2>
              {/* <button 
                onClick={handleClose}
                className="text-white/80 hover:text-white hover:rotate-90 transition-all duration-300 hover:scale-110"
                aria-label="Close form"
              >
                <X size={24} strokeWidth={2.5} />
              </button> */}
            </div>
          </div>

          {/* Success message */}
          {isSubmitted && (
            <div className="mx-6 mt-6 p-4 bg-green-500/10 border border-green-500/30 rounded-xl flex items-center gap-3 animate-slide-down">
              <CheckCircle className="text-green-400 flex-shrink-0" size={24} />
              <p className="text-green-300 font-medium">
                Registration successful! Welcome aboard.
              </p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            {/* Email field */}
            <div
              className="space-y-2 animate-slide-up"
              style={{ animationDelay: "0.2s" }}
            >
              <label
                htmlFor="email"
                className="block text-sm font-semibold text-sky-400"
              >
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                onChange={handleChange}
                className={`w-full px-4 py-3 bg-black/40 border ${
                  errors.email ? "border-red-500/50" : "border-sky-500/30"
                } rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-500/30 transition-all duration-300`}
                placeholder={apiData?.email || formData.email}
              />
              {errors.email && (
                <p className="text-red-400 text-xs flex items-center gap-1 mt-1">
                  <AlertCircle size={12} />
                  {errors.email}
                </p>
              )}
            </div>
            {apiData?.fields?.map((element, index) => {
              if (!element.label) return null;
              return (
                <div
                  key={index}
                  className="space-y-2 animate-slide-up"
                  style={{ animationDelay: "0.3s" }}
                >
                  <label
                    htmlFor={element.label}
                    className="block text-sm font-semibold text-gray-400"
                  >
                    {element.label}
                  </label>
                  <input
                    type={element.type || "text"}
                    id={element.label}
                    name={element.label}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-black/40 border border-sky-500/30 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-500/30 transition-all duration-300"
                    placeholder={""}
                  />
                </div>
              );
            })}

            {/* Submit button */}
            <button
              type="submit"
              className="w-full mt-6 px-6 py-4 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white font-bold rounded-xl shadow-lg hover:shadow-sky-500/50 transform hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 animate-slide-up"
              style={{ animationDelay: "0.8s" }}
            >
              Submit
            </button>
          </form>

          {/* Footer decoration */}
          <div className="h-2 bg-gradient-to-r from-sky-500 via-blue-600 to-sky-500"></div>
        </div>
      </div>

      {/* Custom CSS for animations */}
      <style>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes slide-up {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes slide-down {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fade-in {
          animation: fade-in 0.6s ease-out;
        }

        .animate-slide-up {
          animation: slide-up 0.5s ease-out;
          animation-fill-mode: both;
        }

        .animate-slide-down {
          animation: slide-down 0.4s ease-out;
        }

        /* Custom scrollbar */
        ::-webkit-scrollbar {
          width: 8px;
        }

        ::-webkit-scrollbar-track {
          background: rgba(0, 0, 0, 0.3);
        }

        ::-webkit-scrollbar-thumb {
          background: rgba(14, 165, 233, 0.5);
          border-radius: 4px;
        }

        ::-webkit-scrollbar-thumb:hover {
          background: rgba(14, 165, 233, 0.7);
        }

        /* Select dropdown styling */
        select option {
          background: #1a1a1a;
          color: white;
        }
      `}</style>
    </div>
  );
}
