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
          <option
            ng-repeat="c in credentials | unique:'summary_fields.credential_type.name'"
            value="{{ c.summary_fields.credential_type.name }}"
          >
            {{ c.summary_fields.credential_type.name }}
          </option>
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
})