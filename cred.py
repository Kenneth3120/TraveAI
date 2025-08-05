.when('/credentials', {
  template: `
    <div class="card">
      <h3>Note</h3>
      <p>
        Credentials are fetched read-only from Ansible Tower via Basic Auth.
        Ensure you’ve saved your Tower username/password in the Configuration page.
      </p>
    </div>

    <div class="card">
      <h2 class="title">Credential List</h2>

      <!-- Filters -->
      <div class="filters">
        <!-- Name filter -->
        <input
          type="text"
          ng-model="filterName"
          placeholder="Search by Name"
          class="filter-input"
        />

        <!-- Type filter -->
        <select ng-model="filterType" class="filter-input">
          <option value="">All Types</option>
          <option value="Amazon Web Services">Amazon Web Services</option>
          <option value="Ansible Galaxy/Automation Hub API Token">Ansible Galaxy/Automation Hub API Token</option>
          <option value="Apigee API Token">Apigee API Token</option>
          <option value="AWS Secrets Manager lookup">AWS Secrets Manager lookup</option>
          <option value="Centrify Vault Credential Provider Lookup">Centrify Vault Credential Provider Lookup</option>
          <option value="Container Registry">Container Registry</option>
          <option value="CyberArk Central Credential Provider Lookup">CyberArk Central Credential Provider Lookup</option>
          <option value="CyberArk Conjur Secrets Manager Lookup">CyberArk Conjur Secrets Manager Lookup</option>
          <option value="Github Personal Access Token">Github Personal Access Token</option>
          <option value="GitLab Personal Access Token">GitLab Personal Access Token</option>
          <option value="Google Compute Engine">Google Compute Engine</option>
          <option value="GPG Public Key">GPG Public Key</option>
          <option value="HashiCorp Vault Secret Lookup">HashiCorp Vault Secret Lookup</option>
          <option value="HashiCorp Vault Signed SSH">HashiCorp Vault Signed SSH</option>
          <option value="Insights">Insights</option>
          <option value="Machine">Machine</option>
          <option value="Microsoft Azure Resource Manager">Microsoft Azure Resource Manager</option>
          <option value="Network">Network</option>
          <option value="OpenShift or Kubernetes API Bearer Token">OpenShift or Kubernetes API Bearer Token</option>
          <option value="OpenStack">OpenStack</option>
          <option value="Personal Token">Personal Token</option>
          <option value="Pinniped Login">Pinniped Login</option>
          <option value="Red Hat Ansible Automation Platform">Red Hat Ansible Automation Platform</option>
          <option value="Red Hat Satellite 6">Red Hat Satellite 6</option>
          <option value="Red Hat Virtualization">Red Hat Virtualization</option>
          <option value="Source Control">Source Control</option>
          <option value="Terraform ENV Vars">Terraform ENV Vars</option>
          <option value="Thycotic DevOps Secrets Vault">Thycotic DevOps Secrets Vault</option>
          <option value="Thycotic Secret Server">Thycotic Secret Server</option>
          <option value="Vault">Vault</option>
          <option value="VMware vCenter">VMware vCenter</option>
        </select>

        <!-- Organization filter -->
        <select ng-model="filterInstance" class="filter-input">
          <option value="">All Organizations</option>
          <option
            ng-repeat="c in credentials | unique:'summary_fields.organization.name'"
            value="{{ c.summary_fields.organization.name }}"
          >
            {{ c.summary_fields.organization.name }}
          </option>
        </select>
      </div>

      <!-- Credentials Table -->
      <table class="instance-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Type</th>
            <th>Username</th>
            <th>Organization</th>
            <th>Kind</th>
            <th>Managed?</th>
            <th>Created</th>
            <th>Modified</th>
          </tr>
        </thead>
        <tbody>
          <tr ng-if="!(credentials | filter:credFilter).length">
            <td colspan="8" style="text-align:center;">No credentials found.</td>
          </tr>
          <tr ng-repeat="cred in credentials | filter:credFilter">
            <td>{{ cred.name }}</td>
            <td>{{ cred.summary_fields.credential_type.name }}</td>
            <td>{{ cred.inputs.username || '—' }}</td>
            <td>{{ cred.summary_fields.organization.name }}</td>
            <td>{{ cred.kind }}</td>
            <td>{{ cred.managed ? 'Yes' : 'No' }}</td>
            <td>{{ cred.created | date:'short' }}</td>
            <td>{{ cred.modified | date:'short' }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  `,
  controller: 'CredentialController'
});