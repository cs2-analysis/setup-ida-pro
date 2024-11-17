# setup-ida-pro

Action to setup IDA Pro

## Usage example

```yaml
- name: Setup IDA Pro
  uses: cs2-analysis/setup-ida-pro@v1
  with:
    # Download link to the IDA Pro installer (appropriate for the runner OS)
    download-link: 'https://example.com/some/path/ida-pro_90_x64linux.run'
    # Newline-separated list of ZIP files to extract over the IDA Pro installation (license, plugins, etc.)
    overlay-links: |
      https://example.com/some/path/license.zip
      https://example.com/some/path/some-plugin.zip
```