import React, { FormEvent, PureComponent } from 'react';
import { connect } from 'react-redux';
import { Forms } from '@grafana/ui';
import { dateTime } from '@grafana/data';
import { FolderPicker } from 'app/core/components/Select/FolderPicker';
import DataSourcePicker from 'app/core/components/Select/DataSourcePicker';
import { changeDashboardTitle, resetDashboard, saveDashboard, changeDashboardUid } from '../state/actions';
import { DashboardSource } from '../state/reducers';
import { StoreState } from '../../../types';

interface Props {
  dashboard: any;
  inputs: any[];
  source: DashboardSource;
  uidExists: boolean;
  uidError: string;
  meta?: any;

  resetDashboard: typeof resetDashboard;
  changeDashboardTitle: typeof changeDashboardTitle;
  saveDashboard: typeof saveDashboard;
  changeDashboardUid: typeof changeDashboardUid;
}

interface State {
  folderId: number;
  uidReset: boolean;
}

class ImportDashboardForm extends PureComponent<Props, State> {
  state: State = {
    folderId: 0,
    uidReset: false,
  };

  onSubmit = () => {
    this.props.saveDashboard(this.state.folderId);
  };

  onCancel = () => {
    this.props.resetDashboard();
  };

  onTitleChange = (event: FormEvent<HTMLInputElement>) => {
    this.props.changeDashboardTitle(event.currentTarget.value);
  };

  onFolderChange = ($folder: { title: string; id: number }) => {
    this.setState({ folderId: $folder.id });
  };

  onUidChange = (event: FormEvent<HTMLInputElement>) => {
    this.props.changeDashboardUid(event.currentTarget.value);
  };

  onUidReset = () => {
    this.setState({ uidReset: true });
  };

  render() {
    const { dashboard, inputs, meta, source, uidExists, uidError } = this.props;
    const { uidReset } = this.state;

    return (
      <>
        {source === DashboardSource.Gcom && (
          <div style={{ marginBottom: '24px' }}>
            <div>
              <Forms.Legend>
                Importing Dashboard from{' '}
                <a
                  href={`https://grafana.com/dashboards/${dashboard.gnetId}`}
                  className="external-link"
                  target="_blank"
                >
                  Grafana.com
                </a>
              </Forms.Legend>
            </div>
            <table className="filter-table form-inline">
              <tbody>
                <tr>
                  <td>Published by</td>
                  <td>{meta.orgName}</td>
                </tr>
                <tr>
                  <td>Updated on</td>
                  <td>{dateTime(meta.updatedAt).format('YYYY-MM-DD HH:mm:ss')}</td>
                </tr>
              </tbody>
            </table>
          </div>
        )}
        <Forms.Form onSubmit={this.onSubmit}>
          {() => {
            return (
              <>
                <Forms.Legend className="section-heading">Options</Forms.Legend>
                <Forms.Field label="Name">
                  <Forms.Input size="md" type="text" value={dashboard.title} onChange={this.onTitleChange} />
                </Forms.Field>
                <Forms.Field label="Folder">
                  <FolderPicker onChange={this.onFolderChange} useInNextGenForms={true} initialFolderId={0} />
                </Forms.Field>
                <Forms.Field
                  label="Unique identifier (uid)"
                  description="The unique identifier (uid) of a dashboard can be used for uniquely identify a dashboard between multiple Grafana installs.
                The uid allows having consistent URL’s for accessing dashboards so changing the title of a dashboard will not break any
                bookmarked links to that dashboard."
                  invalid={uidExists}
                  error={uidError}
                >
                  <Forms.Input
                    size="md"
                    value={uidReset ? dashboard.uid : 'Value set'}
                    onChange={this.onUidChange}
                    disabled={!uidReset}
                    addonAfter={<Forms.Button onClick={this.onUidReset}>Clear</Forms.Button>}
                  />
                </Forms.Field>
                {inputs.map((input: any, index: number) => {
                  if (input.type === 'datasource') {
                    return (
                      <Forms.Field label={input.label} key={`${input.label}-${index}`}>
                        <DataSourcePicker
                          datasources={input.options}
                          onChange={() => console.log('something changed')}
                          current={input.options[0]}
                        />
                      </Forms.Field>
                    );
                  }
                  return null;
                })}
                <div>
                  <Forms.Button type="submit" variant="primary" onClick={this.onSubmit}>
                    Import
                  </Forms.Button>
                  <Forms.Button type="reset" variant="secondary" onClick={this.onCancel}>
                    Cancel
                  </Forms.Button>
                </div>
              </>
            );
          }}
        </Forms.Form>
      </>
    );
  }
}

const mapStateToProps = (state: StoreState) => {
  const source = state.importDashboard.source;

  return {
    dashboard: state.importDashboard.dashboard,
    meta: state.importDashboard.meta,
    source,
    inputs: state.importDashboard.inputs,
    uidExists: state.importDashboard.uidExists,
    uidError: state.importDashboard.uidError,
  };
};

const mapDispatchToProps = {
  changeDashboardTitle,
  resetDashboard,
  saveDashboard,
  changeDashboardUid,
};

export default connect(mapStateToProps, mapDispatchToProps)(ImportDashboardForm);