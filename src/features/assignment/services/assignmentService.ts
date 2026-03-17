/*
 *  Assignment API service – HTTP calls (port 8001)
 */
import { servicesApi } from '../../../lib/axios';
import type { Assignment, AssignmentUpdatePayload } from '../types/assignment.types';

const ASSIGNMENT_PREFIX = '/assignment';

export const fetchAssignmentsApi = async (): Promise<Assignment[]> => {
    const { data } = await servicesApi.get<Assignment[]>(
        `${ASSIGNMENT_PREFIX}/get-assignments`,
    );
    return data;
};

export const createAssignmentApi = async (assignment: {
    employee_id: string;
    client_id: string;
    start_date: string;
    end_date: string;
    regular_rate: number;
    overtime_rate: number;
    double_time_rate: number;
}): Promise<Assignment> => {
    const { data } = await servicesApi.post<Assignment>(
        `${ASSIGNMENT_PREFIX}/assign-employee`,
        assignment,
    );
    return data;
};

export const updateAssignmentApi = async (
    assignmentId: string,
    payload: AssignmentUpdatePayload,
): Promise<Assignment> => {
    const { data } = await servicesApi.put<Assignment>(
        `${ASSIGNMENT_PREFIX}/${assignmentId}`,
        payload,
    );
    return data;
};

export const deleteAssignmentApi = async (
    assignmentId: string,
): Promise<Assignment> => {
    const { data } = await servicesApi.delete<Assignment>(
        `${ASSIGNMENT_PREFIX}/${assignmentId}`,
    );
    return data;
};
