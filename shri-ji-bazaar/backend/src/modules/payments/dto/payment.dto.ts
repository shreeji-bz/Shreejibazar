import joi from 'joi';

export const CreateDepositDto = joi.object({
  amount: joi.number().integer().positive().required().messages({
    'number.positive': 'Amount must be greater than 0',
    'number.empty': 'Amount is required',
    'any.required': 'Amount is required',
  }),
  method: joi.string().valid('upi', 'bank_transfer', 'paytm', 'phonepe', 'cash', 'points', 'admin').required(),
  referenceId: joi.string().allow(null, ''),
  notes: joi.string().allow(null, ''),
});

export const CreateWithdrawalDto = joi.object({
  amount: joi.number().integer().positive().required().messages({
    'number.positive': 'Amount must be greater than 0',
    'number.empty': 'Amount is required',
    'any.required': 'Amount is required',
  }),
  method: joi.string().valid('upi', 'bank_transfer', 'paytm', 'phonepe', 'cash', 'points', 'admin').required(),
  referenceId: joi.string().allow(null, ''),
  notes: joi.string().allow(null, ''),
});

export const ApprovePaymentDto = joi.object({
  adminNotes: joi.string().allow(null, ''),
});

export const RejectPaymentDto = joi.object({
  adminNotes: joi.string().required().messages({
    'any.required': 'Admin notes are required for rejection',
  }),
});

export const PaymentQueryDto = joi.object({
  page: joi.number().integer().min(1).default(1),
  limit: joi.number().integer().min(1).max(100).default(20),
  type: joi.string().valid('deposit', 'withdrawal', 'bonus', 'referral', 'admin_credit', 'admin_debit', 'refund', 'settlement').optional(),
  status: joi.string().valid('pending', 'approved', 'rejected', 'completed', 'failed', 'cancelled').optional(),
});

export type CreateDepositInput = {
  amount: number;
  method: string;
  referenceId?: string;
  notes?: string;
};

export type CreateWithdrawalInput = {
  amount: number;
  method: string;
  referenceId?: string;
  notes?: string;
};

export type ApprovePaymentInput = {
  adminNotes?: string;
};

export type RejectPaymentInput = {
  adminNotes: string;
};

export type PaymentQueryInput = {
  page?: number;
  limit?: number;
  type?: string;
  status?: string;
};
