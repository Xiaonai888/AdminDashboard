import React, { useMemo, useState } from 'react'

const styles = `
  .si-maintenance {
    display: grid;
    grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
    gap: 18px;
    margin-top: 18px;
  }

  .si-maintenance-card {
    border: 1px solid #E2E8F0;
    border-radius: 16px;
    background: #FFFFFF;
    overflow: hidden;
  }

  .si-maintenance-head {
    padding: 16px 18px;
    border-bottom: 1px solid #EEF2F7;
  }

  .si-maintenance-title {
    margin: 0;
    color: #0F172A;
    font-size: 14px;
    font-weight: 950;
  }

  .si-maintenance-subtitle {
    margin-top: 4px;
    color: #94A3B8;
    font-size: 10px;
    font-weight: 750;
    line-height: 1.5;
  }

  .si-maintenance-body {
    padding: 16px 18px;
  }

  .si-maintenance-grid {
    display: grid;
    gap: 10px;
  }

  .si-maintenance-select {
    width: 100%;
    min-height: 40px;
    border: 1px solid #E2E8F0;
    border-radius: 11px;
    background: #FFFFFF;
    color: #334155;
    padding: 0 11px;
    font: inherit;
    font-size: 10px;
    font-weight: 850;
    outline: none;
  }

  .si-maintenance-select:focus {
    border-color: #4F46E5;
    box-shadow: 0 0 0 3px rgba(79, 70, 229, .08);
  }

  .si-maintenance-btn {
    min-height: 38px;
    border: 1px solid #C7D2FE;
    border-radius: 11px;
    background: #EEF2FF;
    color: #4F46E5;
    padding: 0 12px;
    font: inherit;
    font-size: 10px;
    font-weight: 950;
    cursor: pointer;
  }

  .si-maintenance-btn.restore {
    border-color: #A7F3D0;
    background: #ECFDF5;
    color: #047857;
  }

  .si-maintenance-btn:disabled {
    opacity: .55;
    cursor: not-allowed;
  }

  .si-maintenance-note {
    color: #94A3B8;
    font-size: 9px;
    font-weight: 750;
    line-height: 1.55;
  }

  .si-ignored-list {
    max-height: 300px;
    overflow: auto;
  }

  .si-ignored-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    padding: 12px 16px;
    border-bottom: 1px solid #F1F5F9;
  }

  .si-ignored-row:last-child {
    border-bottom: 0;
  }

  .si-ignored-term {
    min-width: 0;
    color: #0F172A;
    font-size: 11px;
    font-weight: 900;
    word-break: break-word;
  }

  .si-ignored-alias {
    margin-top: 3px;
    color: #94A3B8;
    font-size: 9px;
    font-weight: 750;
  }

  .si-maintenance-empty {
    padding: 26px 18px;
    color: #94A3B8;
    font-size: 10px;
    font-weight: 800;
    text-align: center;
  }

  @media (max-width: 900px) {
    .si-maintenance {
      grid-template-columns: 1fr;
    }
  }
`

export default function AdminSearchInsightsMaintenance({
  groups = [],
  ignoredGroups = [],
  actionLoading = false,
  onSplitAlias,
  onRestoreGroup,
}) {
  const splitGroups = useMemo(
    () =>
      groups.filter(
        (group) =>
          Array.isArray(group.aliases) &&
          group.aliases.length > 1
      ),
    [groups]
  )
  const [groupId, setGroupId] = useState('')
  const [aliasKey, setAliasKey] = useState('')

  const selectedGroup = splitGroups.find(
    (group) => String(group.id) === String(groupId)
  )
  const aliases = Array.isArray(selectedGroup?.aliases)
    ? selectedGroup.aliases
    : []

  function chooseGroup(value) {
    setGroupId(value)
    setAliasKey('')
  }

  function submitSplit() {
    if (!groupId || !aliasKey) return
    onSplitAlias?.(Number(groupId), aliasKey)
  }

  return (
    <>
      <style>{styles}</style>

      <div className="si-maintenance">
        <section className="si-maintenance-card">
          <div className="si-maintenance-head">
            <h3 className="si-maintenance-title">
              Split Search Alias
            </h3>
            <div className="si-maintenance-subtitle">
              Move one alias into its own group for future searches.
            </div>
          </div>

          <div className="si-maintenance-body">
            {splitGroups.length === 0 ? (
              <div className="si-maintenance-empty">
                No grouped aliases are available to split.
              </div>
            ) : (
              <div className="si-maintenance-grid">
                <select
                  className="si-maintenance-select"
                  value={groupId}
                  onChange={(event) =>
                    chooseGroup(event.target.value)
                  }
                >
                  <option value="">Choose search group</option>
                  {splitGroups.map((group) => (
                    <option value={group.id} key={group.id}>
                      {group.term}
                    </option>
                  ))}
                </select>

                <select
                  className="si-maintenance-select"
                  value={aliasKey}
                  onChange={(event) =>
                    setAliasKey(event.target.value)
                  }
                  disabled={!selectedGroup}
                >
                  <option value="">Choose alias to split</option>
                  {aliases.map((alias) => (
                    <option
                      value={alias.normalized_term}
                      key={
                        alias.normalized_term ||
                        alias.term
                      }
                    >
                      {alias.term}
                    </option>
                  ))}
                </select>

                <button
                  type="button"
                  className="si-maintenance-btn"
                  disabled={
                    actionLoading ||
                    !groupId ||
                    !aliasKey
                  }
                  onClick={submitSplit}
                >
                  Split Alias
                </button>

                <div className="si-maintenance-note">
                  Historical totals stay with the original group. Only future searches use the new group.
                </div>
              </div>
            )}
          </div>
        </section>

        <section className="si-maintenance-card">
          <div className="si-maintenance-head">
            <h3 className="si-maintenance-title">
              Ignored Search Groups
            </h3>
            <div className="si-maintenance-subtitle">
              Restore a group if it was ignored by mistake.
            </div>
          </div>

          <div className="si-ignored-list">
            {ignoredGroups.length === 0 ? (
              <div className="si-maintenance-empty">
                No ignored search groups.
              </div>
            ) : (
              ignoredGroups.map((group) => (
                <div
                  className="si-ignored-row"
                  key={group.id}
                >
                  <div className="si-ignored-term">
                    {group.term || 'Untitled'}
                    <div className="si-ignored-alias">
                      {(group.aliases || [])
                        .map((alias) => alias.term)
                        .filter(Boolean)
                        .slice(0, 4)
                        .join(', ') || 'No aliases'}
                    </div>
                  </div>

                  <button
                    type="button"
                    className="si-maintenance-btn restore"
                    disabled={actionLoading}
                    onClick={() =>
                      onRestoreGroup?.(Number(group.id))
                    }
                  >
                    Restore
                  </button>
                </div>
              ))
            )}
          </div>
        </section>
      </div>
    </>
  )
}
