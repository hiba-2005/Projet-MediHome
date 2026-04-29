package ma.ensa.medihomemobile.utils;

public class ApiConfig {

    public static final String BASE_URL = "http://192.168.8.27/medical-home-visits-backend/public/api";

    // AUTH
    public static final String LOGIN_PATIENT = BASE_URL + "/login/patient";
    public static final String LOGIN_STAFF = BASE_URL + "/login/staff";
    public static final String REGISTER_PATIENT = BASE_URL + "/patients/register";

    // API
    public static final String PATIENTS = BASE_URL + "/patients";
    public static final String STAFF = BASE_URL + "/staff";
    public static final String HOME_VISITS = BASE_URL + "/home-visits";
    public static final String VISIT_REPORTS = BASE_URL + "/visit-reports";

    public static String getStaffVisits(int idStaff) {
        return BASE_URL + "/staff/" + idStaff + "/visits";
    }

    public static String updateVisitStatus(int idHomeVisit) {
        return BASE_URL + "/home-visits/" + idHomeVisit + "/status";
    }

    public static String deleteVisit(int idHomeVisit) {
        return BASE_URL + "/home-visits/" + idHomeVisit;
    }

    public static String deleteReport(int idReport) {
        return BASE_URL + "/visit-reports/" + idReport;
    }

    public static String getPatientDashboard(int idPatient) {
        return BASE_URL + "/patients/" + idPatient + "/dashboard";
    }
}