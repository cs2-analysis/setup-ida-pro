# setup-ida-pro

Action to setup IDA Pro and idalib python module

> [!NOTE]
> Only tested on IDA Pro 9.0.240925 (Windows and Linux)

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
    # Additional BASH command to run after extracting the overlay files (if the overlay files don't extract to the correct location)
    install-command: 'mv some-plugin.so plugins'
    # Use GitHub Actions Cloud Cache instead of tool cache (tool cache is only useful in self-hosted runners, enabled by default)
    # use-cloud-cache: true

- name: Run IDA Pro in batch mode
  run: idat -B sample.exe

- name: Run idalib script
  run: python3 some-idalib-script.py
```