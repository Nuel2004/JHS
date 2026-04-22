import toast from "react-hot-toast";
import { supabase } from "../Client";
import { t } from "i18next";

export async function isEmailTaken(email: string): Promise<boolean> {

    const { data, error } = await supabase
        .rpc('check_email_exists', { p_email: email });

    if (error) {
        toast.error(t('error.checking_email'));
        return false;
    }

    const isTaken = data === true;
    return isTaken;
}