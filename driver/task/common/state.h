// Copyright 2025 Synnax Labs, Inc.
//
// Use of this software is governed by the Business Source License included in the file
// licenses/BSL.txt.
//
// As of the Change Date specified in that file, in accordance with the Business Source
// License, use of this software will be governed by the Apache License, Version 2.0,
// included in the file licenses/APL.txt.

#pragma once

/// internal
#include "driver/task/common/common.h"
#include "driver/task/task.h"

/// modules
#include "x/cpp/status/status.h"

namespace common {
const std::string STOP_CMD_TYPE = "stop";
const std::string START_CMD_TYPE = "start";
const std::string SCAN_CMD_TYPE = "scan";
/// @brief a utility structure for managing the state of tasks.
struct StateHandler {
    /// @brief the task context used to communicate state changes back to Synnax.
    const std::shared_ptr<task::Context> ctx;
    /// @brief the raw synnax task.
    const synnax::Task task;
    /// @brief the accumulated error in the task state.
    xerrors::Error err;
    /// @brief the wrapped raw task state that will be sent back to Synnax.
    task::State wrapped;

    StateHandler(const std::shared_ptr<task::Context> &ctx, const synnax::Task &task):
        ctx(ctx), task(task) {
        this->wrapped.task = task.key;
        this->wrapped.variant = status::VARIANT_SUCCESS;
    }

    /// @brief resets the state handler to its initial state.
    void reset() {
        this->wrapped.variant = status::VARIANT_SUCCESS;
        this->err = xerrors::NIL;
    }

    /// @brief register the provided error in the task state. If err is nil, then it
    /// will be ignored, and false will be returned. Otherwise, the provided error
    /// will override any other accumulated errors.
    bool error(const xerrors::Error &err) {
        if (!err) return false;
        this->wrapped.variant = status::VARIANT_ERROR;
        this->err = err;
        return true;
    }

    void send_warning(const xerrors::Error &err) { this->send_warning(err.data); }

    /// @brief sends the provided warning string to the task. If the task is in
    /// error state, the warning will not be sent.
    void send_warning(const std::string &warning) {
        this->wrapped.key = "";
        // If there's already an error bound, communicate it instead.
        if (!this->err) {
            this->wrapped.variant = status::VARIANT_WARNING;
            this->wrapped.details["message"] = warning;
        } else
            this->wrapped.details["message"] = this->err.data;
        this->ctx->set_state(this->wrapped);
    }

    void clear_warning() {
        if (this->wrapped.variant != status::VARIANT_WARNING) return;
        this->wrapped.variant = status::VARIANT_SUCCESS;
        this->wrapped.details["message"] = "Task started successfully";
        this->ctx->set_state(this->wrapped);
    }

    /// @brief sends a start message to the task state, using the provided command
    /// key as part of the state. If an error has been accumulated, then the error
    /// will be sent as part of the state. If the error is nil, then the task will
    /// be marked as running.
    void send_start(const std::string &cmd_key) {
        this->wrapped.key = cmd_key;
        if (!this->err) {
            this->wrapped.details["running"] = true;
            this->wrapped.details["message"] = "Task started successfully";
        } else {
            this->wrapped.variant = status::VARIANT_ERROR;
            this->wrapped.details["running"] = false;
            this->wrapped.details["message"] = this->err.data;
        }
        this->ctx->set_state(this->wrapped);
    }

    /// @brief sends a stop message to the task state, using the provided command
    /// key as part of the state. If an error has been accumulated, then the error
    /// will be sent as part of the state. Regardless of the error state, the task
    /// will be marked as not running.
    void send_stop(const std::string &cmd_key) {
        this->wrapped.key = cmd_key;
        this->wrapped.details["running"] = false;
        if (this->err) {
            this->wrapped.variant = status::VARIANT_ERROR;
            this->wrapped.details["message"] = this->err.data;
        } else
            this->wrapped.details["message"] = "Task stopped successfully";
        this->ctx->set_state(this->wrapped);
    }
};

/// @brief a utility function that appropriately handles configuration errors and
/// communicates them back to Synnax in the standard format.
inline std::pair<std::unique_ptr<task::Task>, bool> handle_config_err(
    const std::shared_ptr<task::Context> &ctx,
    const synnax::Task &task,
    common::ConfigureResult &res
) {
    task::State state;
    state.task = task.key;
    state.details["running"] = false;
    if (res.error) {
        state.variant = status::VARIANT_ERROR;
        state.details["message"] = res.error.message();
    } else {
        state.variant = status::VARIANT_SUCCESS;
        if (!res.auto_start) {
            state.details["message"] = "Task configured successfully";
        }
    }
    if (res.auto_start) {
        task::Command start_cmd(task.key, START_CMD_TYPE, {});
        res.task->exec(start_cmd);
    } else
        ctx->set_state(state);
    return {std::move(res.task), true};
}
}
