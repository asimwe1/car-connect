import { toast as sonnerToast } from 'sonner';

export const notify = {
	success(message: string, description?: string) {
		sonnerToast.success(message, {
			description,
			style: { borderRadius: 12 },
		});
	},
	error(message: string, description?: string) {
		sonnerToast.error(message, {
			description,
			style: { borderRadius: 12 },
		});
	},
	info(message: string, description?: string) {
		sonnerToast(message, {
			description,
			style: { borderRadius: 12 },
		});
	},
};
