import { useSelector } from 'react-redux';
import { selectSubMenuPermissions } from '../../../Redux/Slices/AuthSlice';

export const PAYROLL_MAIN_MENU = 'leaveandpayroll';
export const PAYROLL_SUB_MENU = 'payrollmanagement';

/**
 * Every Payroll Management screen is governed by the single "payrollmanagement"
 * sub menu, so the flags live in one place rather than being re-derived in each
 * page. If the backend ever splits payroll into finer sub menus, this hook is
 * the only thing that has to change.
 *
 *   view   - reach the module cards and the screens behind them
 *   create - add new records (structures, bank rows, payroll runs…)
 *   edit   - change or approve existing records
 *   delete - remove records
 */
export default function usePayrollPermissions() {
    const permissions = useSelector(selectSubMenuPermissions(PAYROLL_MAIN_MENU, PAYROLL_SUB_MENU));

    return {
        permissions,
        canView: permissions?.view === 'Y',
        canCreate: permissions?.create === 'Y',
        canEdit: permissions?.edit === 'Y',
        canDelete: permissions?.delete === 'Y',
    };
}
