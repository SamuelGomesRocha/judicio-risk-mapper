import { useState, useCallback } from "react";
import { RiskItem } from "@/types/risk";
import { API_CONFIG } from "@/config/api";
import { ConfigSettings } from "@/types/config";

interface UseRiskItemsLoaderOptions {
  analysisId: string;
  config: ConfigSettings;
}

interface UseRiskItemsLoaderReturn {
  riskItems: RiskItem[] | null;
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

/**
 * Hook for fetching risk_items from backend
 * 
 * Fetches GET /api/v1/analyses/{analysis_id} to retrieve granular risk items
 * with individual IDs needed for evaluation submission.
 * 
 * Implements caching with localStorage to avoid refetches during session.
 */
export function useRiskItemsLoader({
  analysisId,
  config,
}: UseRiskItemsLoaderOptions): UseRiskItemsLoaderReturn {
  const [riskItems, setRiskItems] = useState<RiskItem[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const cacheKey = `risk_items_v3_${analysisId}`;

  /**
   * Fetch risk items from backend
   */
  const fetchRiskItems = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Try cache first
      const cached = localStorage.getItem(cacheKey);
      if (cached) {
        try {
          const parsedCache = JSON.parse(cached);
          setRiskItems(parsedCache);
          setIsLoading(false);
          return;
        } catch (e) {
          console.warn("Failed to parse cached risk items, fetching fresh");
        }
      }

      // Generate auth header
      const authHeader = btoa(`${config.username}:${config.password}`);

      // Fetch from backend
      const baseUrl = config.url.replace(/\/ingestion\/?$/, "");
      const response = await fetch(
        `${baseUrl}/analyses/${analysisId}`,
        {
          method: "GET",
          headers: {
            Authorization: `Basic ${authHeader}`,
            "Content-Type": "application/json",
            "bypass-tunnel-reminder": "true",
          },
        }
      );

      if (!response.ok) {
        throw new Error(
          `Failed to fetch risk items: ${response.status} ${response.statusText}`
        );
      }

      const data = await response.json();

      // Assume backend returns { risk_items: RiskItem[] }
      const items: RiskItem[] = data.risk_items || [];

      // Cache for this session
      localStorage.setItem(cacheKey, JSON.stringify(items));

      setRiskItems(items);
      setError(null);
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      setRiskItems(null);
      console.error("Error fetching risk items:", error);
    } finally {
      setIsLoading(false);
    }
  }, [analysisId, config, cacheKey]);

  return {
    riskItems,
    isLoading,
    error,
    refetch: fetchRiskItems,
  };
}

/**
 * Hook for submitting evaluations to backend
 * 
 * Submits POST /api/v1/evaluations with the evaluation payload
 */
export function useEvaluationSubmit(config: ConfigSettings) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const submit = useCallback(
    async (payload: {
      risk_item_id: string;
      evaluator_type: "human";
      context_relevance: number;
      faithfulness: number;
      answer_relevance: number;
      feedback_notes?: string;
    }) => {
      try {
        setIsSubmitting(true);

        const authHeader = btoa(`${config.username}:${config.password}`);

        const baseUrl = config.url.replace(/\/ingestion\/?$/, "");
        const response = await fetch(`${baseUrl}/evaluations`, {
          method: "POST",
          headers: {
            Authorization: `Basic ${authHeader}`,
            "Content-Type": "application/json",
            "bypass-tunnel-reminder": "true",
          },
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          throw new Error(
            `Failed to submit evaluation: ${response.status} ${response.statusText}`
          );
        }

        const result = await response.json();
        return result;
      } finally {
        setIsSubmitting(false);
      }
    },
    [config]
  );

  return {
    submit,
    isSubmitting,
  };
}
