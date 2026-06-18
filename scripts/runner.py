"""
Pipeline runner for パワフェス Combo Planner data pipeline.

Usage:
  python runner.py                   # Run all scripts
  python runner.py 12 13            # Run only scripts 12 and 13
  python runner.py -11              # Run all except 11
  python runner.py --list           # List available scripts

Notes:
  - Scripts 21/22/23 (image slicers) do NOT run automatically since they
    require screenshots to be present in raw_data/screenshots* folders.
    Run them manually: python 21_image_slicer.py 2026-2027
  - Script 11 (character mapping) has hardcoded data and should be run
    manually after updating the raw_data string inside it.
  - Scripts 12/13 read from raw_data/characters_2026-2027.xlsx and
    raw_data/combos_2026-2027.xlsx respectively.
"""
import subprocess
import sys
import os
import re
import time

# Scripts that require manual setup — exclude from default pipeline run
AUTO_SKIP = {'11', '21', '22', '23'}

def get_all_scripts():
    pattern = re.compile(r'^(\d{2})_.*\.py$')
    return sorted([f for f in os.listdir('.') if pattern.match(f)])

def get_scripts_to_run(all_scripts, args):
    if not args:
        # Default: skip AUTO_SKIP scripts
        return [s for s in all_scripts if not any(s.startswith(skip) for skip in AUTO_SKIP)]

    only_run = [a for a in args if not a.startswith('-') and a not in ('--list', '-l')]
    skip_run = [a.lstrip('-') for a in args if a.startswith('-') and a not in ('--list', '-l')]

    filtered = []
    for s in all_scripts:
        is_targeted = not only_run or any(s.startswith(str(a)) for a in only_run)
        is_skipped  = any(s.startswith(str(skip)) for skip in skip_run)
        if is_targeted and not is_skipped:
            filtered.append(s)
    return filtered

def run_pipeline():
    script_dir = os.path.dirname(os.path.abspath(__file__))
    os.chdir(script_dir)

    all_scripts = get_all_scripts()

    if '--list' in sys.argv or '-l' in sys.argv:
        print("\n--- Available Scripts ---")
        for s in all_scripts:
            note = " (manual)" if any(s.startswith(skip) for skip in AUTO_SKIP) else ""
            print(f"  [{s[:2]}] {s}{note}")
        print("-------------------------")
        print("Usage: python runner.py 12 13   (run specific)")
        print("       python runner.py -11      (skip specific)")
        print("       python runner.py           (run auto scripts: 12, 13, 31)\n")
        return

    scripts_to_execute = get_scripts_to_run(all_scripts, sys.argv[1:])

    if not scripts_to_execute:
        print("No scripts matched.")
        return

    results = []
    pipeline_start = time.time()

    print(f"--- Pipeline Root: {script_dir} ---")
    print(f"--- Planned: {len(scripts_to_execute)} / Total: {len(all_scripts)} ---")

    for script_name in scripts_to_execute:
        print(f"\n▶️  STARTING: {script_name}")
        start_tick = time.time()
        try:
            subprocess.run([sys.executable, script_name], check=True)
            status = "PASS"
        except subprocess.CalledProcessError:
            status = "FAIL"
        except Exception as e:
            print(f"Unexpected Error: {e}")
            status = "ERROR"

        duration = time.time() - start_tick
        results.append({"name": script_name, "status": status, "time": f"{duration:.2f}s"})

        if status != "PASS":
            print(f"\n❌ {script_name} halted the pipeline.")
            break

    print("\n" + "=" * 50)
    print(f"{'PIPELINE SUMMARY':^50}")
    print("=" * 50)
    for res in results:
        icon = "✅" if res["status"] == "PASS" else "❌"
        print(f"{icon} {res['name']:<35} {res['status']:<7} [{res['time']}]")
    print("=" * 50)
    print(f"Total Time: {time.time() - pipeline_start:.2f}s\n")

if __name__ == "__main__":
    run_pipeline()
