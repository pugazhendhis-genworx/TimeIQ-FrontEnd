import { servicesApi } from '../../../lib/axios';
import type {
  ClientRule,
  ClientRuleCreatePayload,
  ClientRuleUpdatePayload,
} from '../types/clientRule.types';

const PREFIX = '/rule';

export const createClientRuleApi = async (
  payload: ClientRuleCreatePayload,
): Promise<ClientRule> => {
  const { data } = await servicesApi.post<ClientRule>(
    `${PREFIX}/create_rule`,
    payload,
  );
  return data;
};

export const fetchClientRulesApi = async (clientId: string): Promise<ClientRule[]> => {
  const { data } = await servicesApi.get<ClientRule[]>(
    `${PREFIX}/client/${clientId}`,
  );
  return data;
};

export const fetchClientRulesByStatusApi = async (
  clientId: string,
  isActive: boolean,
): Promise<ClientRule[]> => {
  const { data } = await servicesApi.get<ClientRule[]>(
    `${PREFIX}/client/${clientId}/status/${isActive}`,
  );
  return data;
};

export const updateClientRuleApi = async (
  ruleId: string,
  payload: ClientRuleUpdatePayload,
): Promise<ClientRule> => {
  const { data } = await servicesApi.put<ClientRule>(
    `${PREFIX}/${ruleId}`,
    payload,
  );
  return data;
};
