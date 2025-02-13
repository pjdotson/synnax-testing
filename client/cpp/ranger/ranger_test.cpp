// Copyright 2025 Synnax Labs, Inc.
//
// Use of this software is governed by the Business Source License included in the file
// licenses/BSL.txt.
//
// As of the Change Date specified in that file, in accordance with the Business Source
// License, use of this software will be governed by the Apache License, Version 2.0,
// included in the file licenses/APL.txt.

#include <random>
#include <string>
#include <include/gtest/gtest.h>

#include "client/cpp/synnax.h"
#include "x/cpp/xerrors/errors.h"
#include "client/cpp/testutil/testutil.h"

std::mt19937 gen_rand = random_generator(std::move("Ranger Tests"));

/// @brief it should create a new range and assign it a non-zero key.
TEST(RangerTests, testCreate) {
    const auto client = new_test_client();
    const auto [range, err] = client.ranges.create(
        "test",
        telem::TimeRange(
            telem::TimeStamp(10),
            telem::TimeStamp(100)
        )
    );
    ASSERT_FALSE(err) << err.message();
    ASSERT_EQ(range.name, "test");
    ASSERT_FALSE(range.key.empty());
    ASSERT_EQ(range.time_range.start, telem::TimeStamp(10));
    ASSERT_EQ(range.time_range.end, telem::TimeStamp(100));
}

/// @brief it should retrieve a range by its key.
TEST(RangerTests, testRetrieveByKey) {
    const auto client = new_test_client();
    const auto [range, err] = client.ranges.create(
        "test",
        telem::TimeRange(
            telem::TimeStamp(30),
            telem::TimeStamp(100)
        )
    );
    ASSERT_FALSE(err);
    const auto [got, err2] = client.ranges.retrieve_by_key(range.key);
    ASSERT_FALSE(err2) << err2.message();
    ASSERT_EQ(got.name, "test");
    ASSERT_FALSE(got.key.empty());
    ASSERT_EQ(got.time_range.start, telem::TimeStamp(30));
    ASSERT_EQ(got.time_range.end, telem::TimeStamp(100));
}

/// @brief it should retrieve a range by its name.
TEST(RangerTests, testRetrieveByName) {
    const auto client = new_test_client();
    const auto rand_name = std::to_string(gen_rand());
    const auto [range, err] = client.ranges.create(
        rand_name,
        telem::TimeRange(
            telem::TimeStamp(10),
            telem::TimeStamp(100)
        )
    );
    ASSERT_FALSE(err);
    const auto [got, err2] = client.ranges.retrieve_by_name(rand_name);
    ASSERT_FALSE(err2);
    ASSERT_EQ(got.name, rand_name);
    ASSERT_FALSE(got.key.empty());
    ASSERT_EQ(got.time_range.start, telem::TimeStamp(10));
    ASSERT_EQ(got.time_range.end, telem::TimeStamp(100));
}

/// @brief test retrieve by name not found
TEST(RangerTests, testRetrieveByNameNotFound) {
    auto client = new_test_client();
    auto [got, err] = client.ranges.retrieve_by_name("not_found");
    ASSERT_TRUE(err);
    ASSERT_EQ(err, xerrors::NOT_FOUND);
}

/// @brief it should retrieve multiple ranges by their names.
TEST(RangerTests, testRetrieveMultipleByName) {
    const auto client = new_test_client();
    const auto rand_name = std::to_string(gen_rand());
    const auto [range, err] = client.ranges.create(
        rand_name,
        telem::TimeRange(
            telem::TimeStamp(30),
            telem::TimeStamp(100)
        )
    );
    ASSERT_FALSE(err);
    const auto [range2, err2] = client.ranges.create(
        rand_name,
        telem::TimeRange(
            telem::TimeStamp(30),
            telem::TimeStamp(100)
        )
    );
    ASSERT_FALSE(err2);
    const auto [got, err3] = client.ranges.retrieve_by_name(std::vector{rand_name});
    ASSERT_FALSE(err3);
    ASSERT_EQ(got.size(), 2);
    ASSERT_EQ(got[0].name, rand_name);
    ASSERT_FALSE(got[0].key.empty());
    ASSERT_EQ(got[0].time_range.start, telem::TimeStamp(30));
    ASSERT_EQ(got[0].time_range.end, telem::TimeStamp(100));
    ASSERT_EQ(got[1].name, rand_name);
    ASSERT_FALSE(got[1].key.empty());
    ASSERT_EQ(got[1].time_range.start, telem::TimeStamp(30));
    ASSERT_EQ(got[1].time_range.end, telem::TimeStamp(100));
}

/// @brief it should retrieve multiple ranges by their keys.
TEST(RangerTests, testRetrieveMultipleByKey) {
    auto client = new_test_client();
    auto tr = telem::TimeRange(
        telem::TimeStamp(10 * telem::SECOND),
        telem::TimeStamp(100 * telem::SECOND)
    );
    auto [range, err] = client.ranges.create("test", tr);
    ASSERT_FALSE(err) << err.message();
    auto [range2, err2] = client.ranges.create("test2", tr);
    ASSERT_FALSE(err2) << err2.message();
    auto [got, err3] = client.ranges.retrieve_by_key({range.key, range2.key});
    ASSERT_FALSE(err3) << err3.message();
    ASSERT_EQ(got.size(), 2);
    ASSERT_EQ(got[0].name, "test");
    ASSERT_FALSE(got[0].key.empty());
    ASSERT_EQ(got[0].time_range.start, telem::TimeStamp(10 * telem::SECOND));
    ASSERT_EQ(got[0].time_range.end, telem::TimeStamp(100 * telem::SECOND));
    ASSERT_EQ(got[1].name, "test2");
    ASSERT_FALSE(got[1].key.empty());
    ASSERT_EQ(got[1].time_range.start, telem::TimeStamp(10 * telem::SECOND));
    ASSERT_EQ(got[1].time_range.end, telem::TimeStamp(100 * telem::SECOND));
}


/// @brief it should set a key-value pair on the range.
TEST(RangerTests, testSet) {
    auto client = new_test_client();
    auto [range, err] = client.ranges.create(
        "test",
        telem::TimeRange(
            telem::TimeStamp(30),
            telem::TimeStamp(100)
        )
    );
    ASSERT_FALSE(err);
    err = range.kv.set("test", "test");
    ASSERT_FALSE(err);
}

/// @brief it should get a key-value pair on the range.
TEST(RangerTests, testGet) {
    auto client = new_test_client();
    auto [range, err] = client.ranges.create(
        "test",
        telem::TimeRange(
            telem::TimeStamp(30),
            telem::TimeStamp(100)
        )
    );
    ASSERT_FALSE(err) << err.message();
    err = range.kv.set("test", "test");
    ASSERT_FALSE(err) << err.message();
    auto [val, err2] = range.kv.get("test");
    ASSERT_FALSE(err2) << err2.message();
    ASSERT_EQ(val, "test");
}

/// @brief it should retrieve a key-value pair from a retrieved range.
TEST(RangerTests, testGetFromRetrieved) {
    auto client = new_test_client();
    auto [range, err] = client.ranges.create(
        "test",
        telem::TimeRange(
            telem::TimeStamp(30),
            telem::TimeStamp(100)
        )
    );
    ASSERT_FALSE(err) << err.message();
    err = range.kv.set("test", "test");
    ASSERT_FALSE(err) << err.message();
    auto [got, err2] = client.ranges.retrieve_by_key(range.key);
    ASSERT_FALSE(err2) << err2.message();
    auto [val, err3] = got.kv.get("test");
    ASSERT_FALSE(err3) << err3.message();
    ASSERT_EQ(val, "test");
}


/// @brief it should delete a key-value pair on the range.
TEST(RangerTests, testKVDelete) {
    auto client = new_test_client();
    auto [range, err] = client.ranges.create(
        "test",
        telem::TimeRange(
            telem::TimeStamp(30),
            telem::TimeStamp(10 * telem::SECOND)
        )
    );
    ASSERT_FALSE(err);
    err = range.kv.set("test", "test");
    ASSERT_FALSE(err);
    err = range.kv.del("test");
    ASSERT_FALSE(err);
    auto [val, err2] = range.kv.get("test");
    ASSERT_TRUE(err2) << err2.message();
    ASSERT_EQ(val, "");
}
