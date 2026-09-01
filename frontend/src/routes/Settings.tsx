import ContainerRow from "../components/ContainerRow/ContainerRow";
import SettingsForm from "../components/SettingsForm/SettingsForm";

function Settings() {
  return (
    <div className="settings-page">
      <ContainerRow page>
        <div className="col-md-6 offset-md-3 col-xs-12">
          <h1 className="text-xs-center">Your Settings</h1>
          <SettingsForm />
        </div>
      </ContainerRow>
    </div>
  );
}

export default Settings;
