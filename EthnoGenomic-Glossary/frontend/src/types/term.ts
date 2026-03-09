export type Relation = {
  id: number;
  term_id: number;
  related_id: number;
  type?: string | null;
};

export type Term = {
  id: number;
  term_ru?: string | null;
  term_en?: string | null;
  definition?: string | null;
  definition_en?: string | null;
  context?: string | null;
  context_en?: string | null;
  abbreviation?: string | null;
  active?: boolean;
  relations?: Relation[];
};

export type SearchResponse = {
  results: Term[];
  corrected_query?: string | null;
  used_correction?: boolean;
};
