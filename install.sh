#!/bin/bash
# Claude Agents Kit Installer
# Run with: chmod +x install.sh && ./install.sh

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Get the directory where this script is located
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Target directories
CLAUDE_DIR="$HOME/.claude"
AGENTS_DIR="$CLAUDE_DIR/agents"
COMMANDS_DIR="$CLAUDE_DIR/commands"

# Detect OS
detect_os() {
    case "$(uname -s)" in
        Darwin*)
            echo "macos"
            ;;
        Linux*)
            echo "linux"
            ;;
        *)
            echo "unknown"
            ;;
    esac
}

# Print colored message
print_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[OK]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Create directory if not exists
ensure_dir() {
    local dir="$1"
    if [ ! -d "$dir" ]; then
        mkdir -p "$dir"
        print_success "Created directory: $dir"
    else
        print_info "Directory already exists: $dir"
    fi
}

# Create symlink (idempotent)
create_symlink() {
    local source="$1"
    local target="$2"
    local name="$(basename "$source")"

    if [ -L "$target" ]; then
        # Symlink exists, check if it points to the same source
        local current_source="$(readlink "$target")"
        if [ "$current_source" = "$source" ]; then
            print_info "Symlink already exists: $name"
            return 0
        else
            # Remove old symlink and create new one
            rm "$target"
            ln -s "$source" "$target"
            print_success "Updated symlink: $name"
            return 0
        fi
    elif [ -e "$target" ]; then
        # File/directory exists but is not a symlink
        print_warning "Skipped $name (file exists and is not a symlink)"
        return 1
    else
        # Create new symlink
        ln -s "$source" "$target"
        print_success "Created symlink: $name"
        return 0
    fi
}

# Symlink all files from source directory to target directory
symlink_directory() {
    local source_dir="$1"
    local target_dir="$2"
    local count=0

    if [ ! -d "$source_dir" ]; then
        print_warning "Source directory not found: $source_dir"
        return 0
    fi

    # Find all files (not directories) in source directory
    for item in "$source_dir"/*; do
        if [ -e "$item" ]; then
            local name="$(basename "$item")"
            local target="$target_dir/$name"
            if create_symlink "$item" "$target"; then
                ((count++)) || true
            fi
        fi
    done

    echo "$count"
}

# Main installation
main() {
    echo ""
    echo "========================================"
    echo "   Claude Agents Kit Installer"
    echo "========================================"
    echo ""

    # Detect OS
    OS=$(detect_os)
    if [ "$OS" = "unknown" ]; then
        print_error "Unsupported operating system"
        exit 1
    fi
    print_info "Detected OS: $OS"

    # Create directories
    echo ""
    print_info "Setting up directories..."
    ensure_dir "$CLAUDE_DIR"
    ensure_dir "$AGENTS_DIR"
    ensure_dir "$COMMANDS_DIR"

    # Symlink agents
    echo ""
    print_info "Installing agents..."

    agents_count=0

    # Agents from developers/
    if [ -d "$SCRIPT_DIR/agents/developers" ]; then
        for agent in "$SCRIPT_DIR/agents/developers"/*; do
            if [ -e "$agent" ]; then
                local name="$(basename "$agent")"
                local target="$AGENTS_DIR/$name"
                if create_symlink "$agent" "$target"; then
                    ((agents_count++)) || true
                fi
            fi
        done
    fi

    # Agents from utilities/
    if [ -d "$SCRIPT_DIR/agents/utilities" ]; then
        for agent in "$SCRIPT_DIR/agents/utilities"/*; do
            if [ -e "$agent" ]; then
                local name="$(basename "$agent")"
                local target="$AGENTS_DIR/$name"
                if create_symlink "$agent" "$target"; then
                    ((agents_count++)) || true
                fi
            fi
        done
    fi

    if [ "$agents_count" -eq 0 ]; then
        print_info "No agents found to install"
    else
        print_success "Installed $agents_count agent(s)"
    fi

    # Symlink commands
    echo ""
    print_info "Installing commands..."

    commands_count=0
    if [ -d "$SCRIPT_DIR/commands" ]; then
        for cmd in "$SCRIPT_DIR/commands"/*; do
            if [ -e "$cmd" ]; then
                local name="$(basename "$cmd")"
                local target="$COMMANDS_DIR/$name"
                if create_symlink "$cmd" "$target"; then
                    ((commands_count++)) || true
                fi
            fi
        done
    fi

    if [ "$commands_count" -eq 0 ]; then
        print_info "No commands found to install"
    else
        print_success "Installed $commands_count command(s)"
    fi

    # Print summary
    echo ""
    echo "========================================"
    echo "   Installation Complete"
    echo "========================================"
    echo ""
    print_success "Agents installed to: $AGENTS_DIR"
    print_success "Commands installed to: $COMMANDS_DIR"
    echo ""
    echo "Usage:"
    echo "  - Agents are available as custom agents in Claude Code"
    echo "  - Commands can be run with /command-name in Claude Code"
    echo ""
    echo "To uninstall, remove the symlinks from:"
    echo "  - $AGENTS_DIR"
    echo "  - $COMMANDS_DIR"
    echo ""
}

# Run main function
main
