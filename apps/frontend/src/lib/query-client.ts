import { QueryClient } from "@tanstack/react-query";
import { queryDefaults } from "./query";

export const queryClient = new QueryClient({ defaultOptions: queryDefaults });
