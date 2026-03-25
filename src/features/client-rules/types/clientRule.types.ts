export interface RuleConfig {
  ot_threshold: number;
  dt_threshold: number;
  reg_markup_rate: number;
  ot_markup_rate: number;
  dt_markup_rate: number;
  reg_pay: number;
  ot_pay: number;
  dt_pay: number;
  holiday_pay: number;
}

export interface ClientRule {
  rule_id: string;
  client_id: string;
  rule_type: string;
  rule_config: RuleConfig;
  is_active: boolean;
  created_at: string | null;
}

export interface ClientRuleCreatePayload {
  client_id: string;
  rule_type: string;
  rule_config: RuleConfig;
}

export interface ClientRuleUpdatePayload {
  is_active?: boolean;
  rule_config?: RuleConfig;
}
